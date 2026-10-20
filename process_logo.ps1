Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\BhVSRKR\Desktop\Project\SRKR AI Assistant\public\assets\srkr-logo.jpg"
$destPath = "C:\Users\BhVSRKR\Desktop\Project\SRKR AI Assistant\public\assets\srkr-logo.png"

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $bmp.Width
$h = $bmp.Height

Write-Host "Image size: $w x $h"

# Create a 32-bit ARGB bitmap
$newBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($newBmp)
$g.DrawImage($bmp, 0, 0, $w, $h)
$g.Dispose()
$bmp.Dispose()

# BFS Flood Fill from edges for dark background
$visited = New-Object 'bool[,]' $w, $h
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

# Threshold for black background
$thresh = 35

function IsDark([System.Drawing.Color]$c) {
    return ($c.R -le 35 -and $c.G -le 35 -and $c.B -le 35)
}

# Seed edges
for ($x = 0; $x -lt $w; $x++) {
    $cTop = $newBmp.GetPixel($x, 0)
    if (IsDark $cTop) {
        $queue.Enqueue((New-Object System.Drawing.Point($x, 0)))
        $visited[$x, 0] = $true
    }
    $cBottom = $newBmp.GetPixel($x, $h - 1)
    if (IsDark $cBottom) {
        $queue.Enqueue((New-Object System.Drawing.Point($x, $h - 1)))
        $visited[$x, $h - 1] = $true
    }
}
for ($y = 0; $y -lt $h; $y++) {
    $cLeft = $newBmp.GetPixel(0, $y)
    if (IsDark $cLeft) {
        $queue.Enqueue((New-Object System.Drawing.Point(0, $y)))
        $visited[0, $y] = $true
    }
    $cRight = $newBmp.GetPixel($w - 1, $y)
    if (IsDark $cRight) {
        $queue.Enqueue((New-Object System.Drawing.Point($w - 1, $y)))
        $visited[$w - 1, $y] = $true
    }
}

$transparent = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
$count = 0

$dirs = @(
    @(-1, 0), @(1, 0), @(0, -1), @(0, 1),
    @(-1, -1), @(1, -1), @(-1, 1), @(1, 1)
)

while ($queue.Count -gt 0) {
    $p = $queue.Dequeue()
    $newBmp.SetPixel($p.X, $p.Y, $transparent)
    $count++

    foreach ($d in $dirs) {
        $nx = $p.X + $d[0]
        $ny = $p.Y + $d[1]

        if ($nx -ge 0 -and $nx -lt $w -and $ny -ge 0 -and $ny -lt $h) {
            if (-not $visited[$nx, $ny]) {
                $visited[$nx, $ny] = $true
                $col = $newBmp.GetPixel($nx, $ny)
                if (IsDark $col) {
                    $queue.Enqueue((New-Object System.Drawing.Point($nx, $ny)))
                } elseif ($col.R -le 50 -and $col.G -le 50 -and $col.B -le 50) {
                    # Soft anti-aliased edge
                    $maxC = [Math]::Max($col.R, [Math]::Max($col.G, $col.B))
                    $alpha = [int]([Math]::Min(255, [Math]::Max(0, ($maxC - 20) * 8)))
                    $newBmp.SetPixel($nx, $ny, [System.Drawing.Color]::FromArgb($alpha, $col.R, $col.G, $col.B))
                }
            }
        }
    }
}

Write-Host "Total background pixels cleared to transparent: $count"

$newBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$newBmp.Dispose()
Write-Host "Saved transparent logo to $destPath"
