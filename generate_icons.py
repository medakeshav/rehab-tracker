from PIL import Image, ImageDraw, ImageFont
import os

# Create icons
def create_icon(size):
    # Create a new image with white background
    img = Image.new('RGB', (size, size), color='#4472C4')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple dumbbell/fitness icon
    # Left weight
    draw.ellipse([size*0.15, size*0.35, size*0.35, size*0.65], fill='white')
    # Right weight
    draw.ellipse([size*0.65, size*0.35, size*0.85, size*0.65], fill='white')
    # Bar
    draw.rectangle([size*0.3, size*0.45, size*0.7, size*0.55], fill='white')
    
    # Add emoji-style arm flexing
    # This creates a simple representation
    center = size // 2
    
    return img

# Generate icons
icon_192 = create_icon(192)
icon_192.save('/home/claude/rehab-tracker/icon-192.png')

icon_512 = create_icon(512)
icon_512.save('/home/claude/rehab-tracker/icon-512.png')

print('✓ Icons generated successfully')
