import Foundation

enum BackupCodec {
    static let maximumBytes = 10 * 1024 * 1024
    enum Failure: LocalizedError {
        case tooLarge, unreadable, invalidUTF8
        var errorDescription: String? {
            switch self {
            case .tooLarge: return "Backup exceeds 10 MB."
            case .unreadable: return "The selected backup could not be read."
            case .invalidUTF8: return "The backup is not valid UTF-8 text."
            }
        }
    }
    static func encode(_ text: String) throws -> Data {
        let data = Data(text.utf8)
        guard data.count <= maximumBytes else { throw Failure.tooLarge }
        return data
    }
    static func read(_ url: URL) throws -> String {
        guard let stream = InputStream(url: url) else { throw Failure.unreadable }
        stream.open(); defer { stream.close() }
        var data = Data(); var buffer = [UInt8](repeating: 0, count: 8192)
        while true {
            let count = stream.read(&buffer, maxLength: buffer.count)
            guard count >= 0 else { throw stream.streamError ?? Failure.unreadable }
            if count == 0 { break }
            guard data.count + count <= maximumBytes else { throw Failure.tooLarge }
            data.append(contentsOf: buffer.prefix(count))
        }
        guard let text = String(data: data, encoding: .utf8) else { throw Failure.invalidUTF8 }
        return text
    }
}
