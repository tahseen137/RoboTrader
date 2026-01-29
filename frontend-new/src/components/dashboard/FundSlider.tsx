import { motion } from "framer-motion";
import { Wallet, AlertTriangle, Save } from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface FundSliderProps {
  initialValue?: number;
  maxValue?: number;
  positionSizePercent?: number;
  maxPositions?: number;
  onSave?: (value: number) => void;
}

export function FundSlider({
  initialValue = 3000,
  maxValue = 10000,
  positionSizePercent = 10,
  maxPositions = 3,
  onSave,
}: FundSliderProps) {
  const [value, setValue] = useState(initialValue);
  const [hasChanged, setHasChanged] = useState(false);

  const positionSize = value * (positionSizePercent / 100);
  const totalAtRisk = positionSize * maxPositions;
  const riskPercent = (totalAtRisk / value) * 100;

  const getRiskLevel = () => {
    if (riskPercent < 20) return { label: "Low", color: "text-profit" };
    if (riskPercent < 40) return { label: "Moderate", color: "text-warning" };
    return { label: "High", color: "text-loss" };
  };

  const risk = getRiskLevel();

  const presets = [1000, 3000, 5000, 10000];

  const handleSliderChange = (values: number[]) => {
    setValue(values[0]);
    setHasChanged(true);
  };

  const handlePresetClick = (preset: number) => {
    setValue(preset);
    setHasChanged(true);
  };

  const handleSave = () => {
    if (value < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum trading capital is $100",
        variant: "destructive",
      });
      return;
    }
    onSave?.(value);
    setHasChanged(false);
    toast({
      title: "Capital Updated",
      description: `Trading capital set to $${value.toLocaleString()}`,
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Trading Capital Allocation
        </h3>
        <Button
          onClick={handleSave}
          disabled={!hasChanged}
          size="sm"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>

      {/* Slider */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Slider
            value={[value]}
            onValueChange={handleSliderChange}
            max={maxValue}
            min={0}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>$0</span>
            <span className="text-2xl font-bold font-mono text-primary">
              {formatCurrency(value)}
            </span>
            <span>{formatCurrency(maxValue)}</span>
          </div>
        </div>

        {/* Presets */}
        <div className="flex gap-2">
          {presets.map((preset) => (
            <Button
              key={preset}
              variant={value === preset ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(preset)}
              className={value === preset ? "bg-primary text-primary-foreground" : ""}
            >
              {formatCurrency(preset)}
            </Button>
          ))}
        </div>

        {/* Calculations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Position Size ({positionSizePercent}%)</p>
            <p className="font-semibold font-mono">{formatCurrency(positionSize)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Max Positions</p>
            <p className="font-semibold font-mono">{maxPositions}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total at Risk</p>
            <p className="font-semibold font-mono">{formatCurrency(totalAtRisk)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
            <p className={`font-semibold ${risk.color} flex items-center gap-1`}>
              {riskPercent >= 30 && <AlertTriangle className="w-4 h-4" />}
              {risk.label} ({riskPercent.toFixed(0)}%)
            </p>
          </div>
        </div>

        {/* Validation Warning */}
        {value < 100 && (
          <div className="p-3 rounded-lg bg-loss/10 border border-loss/20 flex items-center gap-2 text-sm text-loss">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Minimum trading capital is $100
          </div>
        )}
      </div>
    </motion.div>
  );
}
