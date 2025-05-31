# Basic tree command ignoring specified directories and files
tree -I 'node_modules|package.json|.replit*|replit.nix|config|.git*'

# Limit depth to 3 levels and ignore directories
tree -L 3 -I 'node_modules|package.json|.replit*|replit.nix|config|.git*'

# Show only directories (no files) and ignore patterns
tree -d -I 'node_modules|package.json|.replit*|replit.nix|config|.git*'

# Include file sizes and ignore patterns
tree -s -I 'node_modules|package.json|.replit*|replit.nix|config|.git*'

# Extended ignore pattern for more Replit files
tree -I 'node_modules|package*.json|.replit*|replit.nix|replit.lock|config|.git*|.upm'

# Save output to file
tree -I 'node_modules|package.json|.replit*|replit.nix|config|.git*' > project_structure.txt

# Combination: limit depth, show sizes, ignore patterns
tree -L 2 -s -I 'node_modules|package.json|.replit*|replit.nix|config|.git*'
