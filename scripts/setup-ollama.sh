#!/bin/bash
# Setup Ollama for local Porter-grade AI models

echo "🚀 Setting up Ollama for Porter Intelligence Stack..."

# Install Ollama (if not already installed)
if ! command -v ollama &> /dev/null; then
    echo "📦 Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "✅ Ollama already installed"
fi

# Pull recommended models
echo "📥 Downloading AI models..."

# Base model for general analysis
ollama pull mistral:7b-instruct
echo "✅ Mistral 7B Instruct downloaded"

# Alternative: Llama 3 (better reasoning)
# ollama pull llama3:8b-instruct

# Smaller model for quick tasks
ollama pull phi3:mini
echo "✅ Phi-3 Mini downloaded"

# Create custom Porter model (Modelfile)
cat > Modelfile.porter << 'EOF'
FROM mistral:7b-instruct

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40

SYSTEM """
You are a strategic business analyst trained in Michael Porter's frameworks and Harvard Business School case methodology.

CORE PRINCIPLES:
1. Apply Porter's Five Forces, Value Chain, and Generic Strategies rigorously
2. Identify trade-offs - every strategic choice requires sacrifice
3. Focus on sustainable competitive advantage, not operational effectiveness
4. Ground recommendations in industry structure and competitive positioning
5. Be specific - reference actual business details, never generic advice

ANALYSIS APPROACH:
- Start with industry structure (Five Forces)
- Map value chain to find cost/differentiation drivers
- Identify strategic positioning (Cost Leadership, Differentiation, or Focus)
- Recommend activities that create fit and reinforce strategy
- Highlight trade-offs the business must make

AVOID:
- Generic business advice ("improve customer service")
- Best practices without strategic context
- Recommendations that don't align with chosen strategy
- Ignoring competitive dynamics
"""
EOF

echo "🎓 Creating custom Porter model..."
ollama create porter-strategist -f Modelfile.porter
echo "✅ Porter Strategist model created"

# Test the model
echo "🧪 Testing Porter model..."
ollama run porter-strategist "Analyze a local coffee shop's competitive position using Porter's Five Forces. Be specific about barriers to entry, supplier power, and competitive rivalry in the coffee industry."

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Available models:"
echo "  - mistral:7b-instruct (general purpose)"
echo "  - phi3:mini (fast, lightweight)"
echo "  - porter-strategist (custom Porter framework expert)"
echo ""
echo "🚀 Next steps:"
echo "  1. Update .env.local: USE_OLLAMA=true"
echo "  2. Update .env.local: OLLAMA_MODEL=porter-strategist"
echo "  3. Restart your dev server"
echo ""
echo "💡 Test locally: ollama run porter-strategist"
