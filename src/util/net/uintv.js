// (C) Jord Nijhuis 2013

/* Gets the first UIntv(UInt which may use 1, 2, 3 or 4 bytes)
	* @param buffer The buffer
	* @return end The end of the UintV
	* @return data The UIntV
*/
function readUIntv(buffer) {
	const ret = {}
	// 1 Byte
	if (buffer[0] & 1) {
		ret.end = 1
		ret.data = buffer[0] >> 1
	// 2 Bytes
	} else if(buffer[0] & 2) {
		ret.end = 2
		ret.data = (buffer.readUInt16LE(0) >> 2) + 0x80
	// 3 Bytes
	} else if(buffer[0] & 4) {
		ret.end = 3
		ret.data = (buffer[2] << 13) + (buffer[1] << 5) + (buffer[0] >> 3) + 0x4080
	// 4 Bytes
	} else {
		ret.end = 4
		ret.data = (buffer.readUInt32LE(0) / 8) + 0x204080
	}
	return ret
}

/* Writes a UIntv(1, 2, 3 or 4 bytes) to the buffer
	* @param integer The integer
	* @return The buffer
*/
function writeUIntv(buffer, offset){
	const length = buffer.length
	// 1 Byte
	if (length < 0x80) {
		const size = Buffer.alloc(1)
		size.writeUInt8((length << 1) + 1, offset || 0)
		return Buffer.concat([size, buffer])
	// 2 Bytes
	} else if(length <  0x4080) {
		const size = Buffer.alloc(2)
		size.writeUInt16LE(((length - 0x80) << 2) + 2, offset || 0)
		return Buffer.concat([size, buffer])
	// 3 Bytes
	} else if(length < 0x204080) {
		const size = Buffer.alloc(3)
		const writeValue = ((length - 0x4080) << 3) + 4
		size.writeUInt8((writeValue & 0xFF), offset || 0)
		size.writeUInt16LE(writeValue >> 8, offset + 1 || 1)
		return Buffer.concat([size, buffer])
	// 4 Bytes
	} else {
		const size = Buffer.alloc(4)
		size.writeUInt32LE((length - 0x204080) * 8, offset || 0)
		return Buffer.concat([size, buffer])
	}
}

module.exports = { readUIntv, writeUIntv }