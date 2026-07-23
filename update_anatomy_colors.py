import re

with open('src/components/stats/AnatomyModel.tsx', 'r') as f:
    content = f.read()

# Replace getMuscleColor function
old_block_pattern = re.compile(r'  // Helper to resolve color based on recovery percentage or workout active status\n  const getMuscleColor = \(id: string\) => \{.*?\n  \};\n', re.DOTALL)

new_block = """  // Helper to resolve color based on recovery percentage or workout active status
  const getMuscleColor = (id: string) => {
    const category = getCategoryForMuscleId(id);
    const inactiveColor = "rgba(156, 163, 175, 0.4)"; // gray-400 with opacity for better visibility
    
    if (!category) return inactiveColor;
    const level = muscleLevels[category] ?? 0;
    
    // 1. Worked-intensity mode (highlightColor === "red")
    if (highlightColor === "red") {
      if (level === 0) {
        return inactiveColor; // not worked
      }
      // worked: return glowing gradient corresponding to level
      return `rgba(101, 163, 13, ${(0.4 + (level / 100) * 0.6).toFixed(2)})`; // bright active primary
    }

    // 2. Recovery theme mode (default green/sore theme)
    if (level === 0) {
      return "rgba(220, 38, 38, 0.8)"; // sore red
    }
    if (level === 100) {
      return "rgba(101, 163, 13, 0.85)"; // recovered primary green
    }
    if (highlightColor === "cyan") {
      return `rgba(2, 132, 199, ${((100 - level) / 100).toFixed(2)})`;
    }

    // Gradient recovery status
    if (level >= 90) return "rgba(101, 163, 13, 0.85)";
    if (level >= 60) return "rgba(217, 119, 6, 0.75)";
    return "rgba(220, 38, 38, 0.8)";
  };
"""

content = old_block_pattern.sub(new_block, content)

with open('src/components/stats/AnatomyModel.tsx', 'w') as f:
    f.write(content)
print("Done")
