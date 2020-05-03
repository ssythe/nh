function readUIntVByteLength(buffer) {
	// 1 Byte
	if (buffer[0] & 1) {
		return 1
	// 2 Bytes
	} else if(buffer[0] & 2) {
		return 2
	// 3 Bytes
	} else if(buffer[0] & 4) {
		return 3
	// 4 Bytes
	} else {
		return 4
	}
}

function writeUIntv(buffer){
	const length = buffer.length
	
	// 1 Byte
	if (length < 0x80) {
		const size = Buffer.alloc(1)
		size.writeUInt8((length << 1) + 1)
		
		return Buffer.concat([size, buffer])
	// 2 Bytes
	} else if (length < 0x4080) {
		const size = Buffer.alloc(2)
		size.writeUInt16LE(((length - 0x80) << 2) + 2)

		return Buffer.concat([size, buffer])
	// 3 Bytes
	} else if (length < 0x204080) {
		const size = Buffer.alloc(3)
		const writeValue = ((length - 0x4080) << 3) + 4
		size.writeUInt8((writeValue & 0xFF))
		size.writeUInt16LE(writeValue >> 8, 1)

		return Buffer.concat([size, buffer])
	// 4 Bytes
	} else {
		const size = Buffer.alloc(4)
		size.writeUInt32LE((length - 0x204080) * 8)

		return Buffer.concat([size, buffer])
	}
}

module.exports = { readUIntVByteLength, writeUIntv }