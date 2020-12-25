function readUIntV(buffer) {
	// 1 Byte
	if (buffer[0] & 1) {
		return [ buffer[0] >> 1, buffer.slice(1) ]
	// 2 Bytes
	} else if(buffer[0] & 2) {
		return [ (buffer.readUInt16LE(0) >> 2) + 0x80, buffer.slice(2) ]
	// 3 Bytes
	} else if(buffer[0] & 4) {
		return [ (buffer[2] << 13) + (buffer[1] << 5) + (buffer[0] >> 3) + 0x4080, buffer.slice(3) ]
	// 4 Bytes
	} else {
		return [ (buffer.readUInt32LE(0) / 8) + 0x204080, buffer.slice(4) ]
	}
}

function writeUIntV(buffer){
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

module.exports = { readUIntV, writeUIntV }