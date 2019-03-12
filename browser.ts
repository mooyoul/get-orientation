import { Orientation } from "./base";

export { Orientation };

const fileReaderMap = new WeakMap<Blob, FileReader>();

export async function getOrientation(input: ArrayBuffer | File | Blob) {
  if (!(input instanceof ArrayBuffer || input instanceof Blob)) {
    throw new TypeError("Unexpected input type");
  }

  let offset = 0;
  const totalBytes = getSize(input);

  // Signature validation
  {
    const bufSignature = await readBytes(input, offset, 4);
    offset += bufSignature.byteLength;

    const signature = new DataView(bufSignature);
    const head = signature.getUint16(0);
    const tail = signature.getUint16(2);

    // Check EXIF SOI first
    if (head === 0xffd8) {
      // This is EXIF structure. handle application markers
      let bufMarker = bufSignature.slice(2);
      do {
        const marker = (new DataView(bufMarker)).getUint16(0);
        if (marker === 0xffe1) { // APP1 Marker - EXIF, or Adobe XMP
          // We must verify that marker segment to avoid conflict.
          // Adobe XMP uses APP1 space too!
          const bufSegmentHead = await readBytes(input, offset, 8);
          const segmentHead = new DataView(bufSegmentHead);

          const isEXIF = segmentHead.getUint16(2) === 0x4578
            && segmentHead.getUint16(4) === 0x6966
            && segmentHead.getUint16(6) === 0x0000;

          if (isEXIF) {
            offset += bufSegmentHead.byteLength;
            break;
          } else {
            const segmentSize = segmentHead.getUint16(0);
            offset += segmentSize;
          }
        } else if (0xffe0 <= marker && marker <= 0xffef) { // Other JPEG application markers
          // e.g. APP0 Marker (JFIF), APP2 Marker (FlashFix Extension, ICC Color Profile), Photoshop IRB...
          // @see http://www.ozhiker.com/electronics/pjmt/jpeg_info/app_segments.html

          // Just skip. we don't need them
          const bufSegmentSize = await readBytes(input, offset, 2);
          offset += bufSegmentSize.byteLength;

          const segmentSize = (new DataView(bufSegmentSize)).getUint16(0);
          const remainingBytes = segmentSize - 2;
          offset += remainingBytes;
        } else { // If any other JPEG marker segment was found, skip entire bytes.
          // Please refer Table B.1 – Marker code assignments from
          // https://www.w3.org/Graphics/JPEG/itu-t81.pdf
          return Orientation.TOP_LEFT;
        }

        bufMarker = await readBytes(input, offset, 2);
        offset += bufMarker.byteLength;
      } while (offset < totalBytes);
    } else if ((head === 0x4949 && tail === 0x2a00) || (head === 0x4d4d && tail === 0x002a)) {
      // yeah this is TIFF header
      // reset offset cursor.
      offset = 0;
    } else { // This stream is not a JPEG file. Skip.
      return Orientation.TOP_LEFT;
    }
  }

  const bufTIFFHeader = await readBytes(input, offset, 8);

  const tiffHeader = new DataView(bufTIFFHeader);
  const isLittleEndian = tiffHeader.getUint16(0) === 0x4949;
  const ifdOffset = tiffHeader.getUint32(4, isLittleEndian);

  // move cursor to IFD block
  offset += ifdOffset;

  const bufFieldCount = await readBytes(input, offset, 2);
  offset += bufFieldCount.byteLength;

  let fieldCount = (new DataView(bufFieldCount)).getUint16(0, isLittleEndian);
  while (fieldCount-- > 0) {
    const bufField = await readBytes(input, offset, 12);
    offset += bufField.byteLength;
    const field = new DataView(bufField);

    const tagId = field.getUint16(0, isLittleEndian);
    if (tagId === 0x112) { // Orientation Tag
      const value = (new DataView(bufField.slice(8, 12))).getUint16(0, isLittleEndian);

      if (1 <= value && value <= 8) {
        return value as Orientation;
      } else {
        throw new Error("Unexpected Orientation Value");
      }
    }
  }

  return Orientation.TOP_LEFT;
}

function readBytes(input: Blob | ArrayBuffer, offset: number, size: number): Promise<ArrayBuffer> {
  if (input instanceof Blob) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      let reader = fileReaderMap.get(input)!;

      if (!reader) {
        reader = new FileReader();
        fileReaderMap.set(input, reader);
      }

      reader.onerror = (e) => {
        reader.onerror = null;
        reader.onload = null;
        reject(e);
      };

      reader.onload = () => {
        reader.onerror = null;
        reader.onload = null;

        resolve(reader.result as ArrayBuffer);
      };

      reader.readAsArrayBuffer(
        input.slice(offset, offset + size),
      );
    });
  }

  return Promise.resolve(input.slice(offset, offset + size));
}

function getSize(input: Blob | ArrayBuffer) {
  return input instanceof Blob ?
    input.size :
    input.byteLength;
}
