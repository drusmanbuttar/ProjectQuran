import AppKit
import Foundation

// A status bar alone is visible while the WebView is starting. The reading
// room has a large emerald panel in the middle of every supported layout.
guard CommandLine.arguments.count == 2,
      let buffer = FileManager.default.contents(atPath: CommandLine.arguments[1]),
      let frame = NSBitmapImageRep(data: buffer) else { exit(2) }
var green = 0
var samples = 0
for row in 4..<47 {
    for column in 4..<46 {
        let x = frame.pixelsWide * column / 50
        let y = frame.pixelsHigh * row / 50
        guard let color = frame.colorAt(x: x, y: y)?.usingColorSpace(.sRGB) else { continue }
        samples += 1
        if color.greenComponent > color.redComponent * 1.6 && color.greenComponent > 0.13 &&
           color.greenComponent < 0.5 && color.blueComponent < 0.5 {
            green += 1
        }
    }
}
guard samples > 1000 && green > 26 else { exit(1) }
print("App reading room visible in \(green) of \(samples) samples.")

