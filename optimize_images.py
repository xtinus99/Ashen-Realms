"""
Image Optimization Script for The Ashen Realms Player Site
Converts PNG and JPEG images to WebP format with significant size reduction.
Also generates thumbnail versions for faster initial loading.
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow library not found. Installing...")
    os.system(f"{sys.executable} -m pip install Pillow")
    from PIL import Image

# Configuration
IMAGES_DIR = Path(__file__).parent / "images"
WEBP_QUALITY = 85  # Good balance of quality and size
THUMBNAIL_MAX_SIZE = (400, 400)  # For card previews


def convert_to_webp(input_path: Path, output_path: Path, quality: int = 85) -> tuple[int, int]:
    """Convert image to WebP format. Returns (original_size, new_size)."""
    original_size = input_path.stat().st_size

    with Image.open(input_path) as img:
        # Convert to RGB if necessary (WebP doesn't support all modes)
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            # Keep alpha channel for transparent images
            img = img.convert('RGBA')
        else:
            img = img.convert('RGB')

        img.save(output_path, 'WEBP', quality=quality, method=6)

    new_size = output_path.stat().st_size
    return original_size, new_size


def create_thumbnail(input_path: Path, output_path: Path, max_size: tuple = (400, 400)) -> int:
    """Create a thumbnail version of the image. Returns new size."""
    with Image.open(input_path) as img:
        # Calculate aspect-ratio-preserving size
        img.thumbnail(max_size, Image.Resampling.LANCZOS)

        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            img = img.convert('RGBA')
        else:
            img = img.convert('RGB')

        img.save(output_path, 'WEBP', quality=80, method=6)

    return output_path.stat().st_size


def main():
    if not IMAGES_DIR.exists():
        print(f"Error: Images directory not found at {IMAGES_DIR}")
        return

    # Create images subdirectory (for optimized webp files)
    images_out_dir = IMAGES_DIR / "images"
    images_out_dir.mkdir(exist_ok=True)

    thumbnails_dir = IMAGES_DIR / "thumbnails"
    thumbnails_dir.mkdir(exist_ok=True)

    # Find all PNG and JPEG files
    image_files = []
    image_files.extend(IMAGES_DIR.glob("*.png"))
    image_files.extend(IMAGES_DIR.glob("*.jpg"))
    image_files.extend(IMAGES_DIR.glob("*.jpeg"))

    if not image_files:
        print("No image files found to convert.")
        return

    print(f"Found {len(image_files)} image files to convert\n")
    print("=" * 60)

    total_original = 0
    total_webp = 0
    total_thumb = 0

    for img_path in sorted(image_files):
        name = img_path.stem
        webp_path = images_out_dir / f"{name}.webp"
        thumb_path = thumbnails_dir / f"{name}.webp"

        try:
            # Convert to full-size WebP
            orig_size, webp_size = convert_to_webp(img_path, webp_path, WEBP_QUALITY)

            # Create thumbnail
            thumb_size = create_thumbnail(img_path, thumb_path, THUMBNAIL_MAX_SIZE)

            total_original += orig_size
            total_webp += webp_size
            total_thumb += thumb_size

            reduction = (1 - webp_size / orig_size) * 100
            print(f"{name}")
            print(f"  Original: {orig_size / 1024 / 1024:.2f} MB")
            print(f"  WebP:     {webp_size / 1024:.0f} KB ({reduction:.0f}% smaller)")
            print(f"  Thumb:    {thumb_size / 1024:.0f} KB")
            print()

        except Exception as e:
            print(f"Error processing {name}: {e}")

    print("=" * 60)
    print("\nSUMMARY")
    print(f"  Original images: {total_original / 1024 / 1024:.2f} MB")
    print(f"  WebP files:      {total_webp / 1024 / 1024:.2f} MB ({(1 - total_webp/total_original)*100:.0f}% reduction)")
    print(f"  Thumbnails:      {total_thumb / 1024 / 1024:.2f} MB")
    print(f"\n  Total savings:   {(total_original - total_webp) / 1024 / 1024:.2f} MB")
    print(f"\nOptimized images saved to: {images_out_dir}")
    print(f"Thumbnails saved to: {thumbnails_dir}")


if __name__ == "__main__":
    main()
