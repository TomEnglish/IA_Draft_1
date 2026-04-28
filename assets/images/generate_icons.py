"""Generate Kindred Industrial logo icons for QR Asset Scanner."""

import math
from pathlib import Path
from PIL import Image, ImageDraw

GOLD = (176, 160, 122)  # #B0A07A
WHITE = (255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)


def hexagon_points(cx, cy, radius):
    """Return vertices of a flat-top regular hexagon."""
    points = []
    for i in range(6):
        angle_deg = 60 * i  # flat-top starts at 0 degrees
        angle_rad = math.radians(angle_deg)
        x = cx + radius * math.cos(angle_rad)
        y = cy + radius * math.sin(angle_rad)
        points.append((x, y))
    return points


def triangle_points(cx, cy, size):
    """Return vertices of an upward-pointing equilateral triangle centered at (cx, cy).
    'size' is the width of the triangle base."""
    # Height of equilateral triangle
    h = size * math.sqrt(3) / 2
    # Center the triangle vertically
    top = (cx, cy - h * 2 / 3)
    bottom_left = (cx - size / 2, cy + h / 3)
    bottom_right = (cx + size / 2, cy + h / 3)
    return [top, bottom_left, bottom_right]


def draw_logo(draw, cx, cy, hex_radius, mode="RGBA"):
    """Draw the hexagon + triangle cutout logo."""
    # Draw hexagon
    hex_pts = hexagon_points(cx, cy, hex_radius)
    draw.polygon(hex_pts, fill=GOLD)

    # Draw white triangle (cutout) — 55% of hexagon width
    # Hexagon width (flat-top) = 2 * radius
    tri_width = hex_radius * 2 * 0.55
    tri_pts = triangle_points(cx, cy, tri_width)

    # Use white for opaque backgrounds, transparent white for RGBA
    if mode == "RGBA":
        tri_color = (255, 255, 255, 255)
    else:
        tri_color = WHITE
    draw.polygon(tri_pts, fill=tri_color)


def generate_icon(size, hex_fraction, bg_color, mode, filename):
    """Generate a single icon file."""
    img = Image.new(mode, (size, size), bg_color)
    draw = ImageDraw.Draw(img)

    cx, cy = size / 2, size / 2
    hex_radius = (size / 2) * hex_fraction

    draw_logo(draw, cx, cy, hex_radius, mode)

    img.save(filename, "PNG")
    print(f"Created {filename} ({size}x{size})")


OUTPUT_DIR = Path(__file__).resolve().parent

# 1. icon.png — 1024x1024, white bg, hexagon ~70% of canvas
generate_icon(1024, 0.70, WHITE, "RGB", OUTPUT_DIR / "icon.png")

# 2. adaptive-icon.png — same as icon
generate_icon(1024, 0.70, WHITE, "RGB", OUTPUT_DIR / "adaptive-icon.png")

# 3. splash-icon.png — 200x200, transparent bg, hexagon fills most of canvas (~85%)
generate_icon(200, 0.85, TRANSPARENT, "RGBA", OUTPUT_DIR / "splash-icon.png")

# 4. favicon.png — 48x48, transparent bg, hexagon fills most of canvas (~85%)
generate_icon(48, 0.85, TRANSPARENT, "RGBA", OUTPUT_DIR / "favicon.png")

print("\nAll icons generated successfully.")
