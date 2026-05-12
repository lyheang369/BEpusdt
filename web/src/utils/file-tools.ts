/**
 * 获取麦克风permission
 * @returns {Promise<boolean>} true/false
 */
export const getMicPower = (): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      resolve(true);
    } catch (error) {
      console.log("Failed to get microphone permission:", error);
      reject(false);
    }
  });
};

/**
 * 十六进制string转换为字节数组
 * @param {string} hexString 十六进制string
 * @returns {Uint8Array} Uint8Array
 */
export const hexStringToByteArray = (hexString: string): Uint8Array => {
  const byteCharacters = atob(hexString);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Uint8Array(byteNumbers);
};

/**
 * Uint8Array转换为 ArrayBuffer
 * @param {Uint8Array} byteArray 数据formatUint8Array
 * @returns {ArrayBuffer} ArrayBuffer
 */
export const byteArrayToArrayBuffer = (byteArray: Uint8Array): ArrayBuffer => {
  const arrayBuffer = new ArrayBuffer(byteArray.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  uint8Array.set(byteArray);
  return arrayBuffer;
};

/**
 * base64转blob
 * @param {string} base64String base64string
 * @param {string} contentType MIME类型，当base64String没有包含 MIME 类型前缀时，就会使用这个参数来指定生成 Blob 的 MIME 类型
 * @param {number} sliceSize 控制处理大文件时的内存使用效率
 * @returns {Blob} 处理后的blob
 */
export const base64ToBlob = (base64String: any, contentType = "", sliceSize = 512): Blob => {
  // min离Base64数据和MIME类型（如果包含前缀）
  const parts = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
  let base64Data = base64String;
  let mimeType = contentType;

  // 如果检测到数据URI前缀
  if (parts) {
    mimeType = parts[1];
    base64Data = parts[2];
  }

  // 解码Base64string
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  // min片处理大文件（避免内存问题）
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  // 创建并返回Blobobject
  return new Blob(byteArrays, { type: mimeType });
};

/**
 * base64转ArrayBuffer
 * @param {string} base64 base64string
 * @returns {ArrayBuffer} ArrayBuffer
 */
export const base64ToArrayBuffer = (base64: any): ArrayBuffer => {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * blob转Uint8Array
 * @param {Blob} blob
 * @returns {Promise<Uint8Array>} Uint8Array
 */
export const blobToUint8Array = async (blob: Blob): Promise<Uint8Array> => {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};
