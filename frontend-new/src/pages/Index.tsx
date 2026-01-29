import { Header } from "@/components/dashboard/Header";
import { AccountOverview } from "@/components/dashboard/AccountOverview";
import { PositionsTable } from "@/components/dashboard/PositionsTable";
import { TradeHistory } from "@/components/dashboard/TradeHistory";
import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { FundSlider } from "@/components/dashboard/FundSlider";
import { PnLChart } from "@/components/dashboard/PnLChart";
import { StatusIndicators } from "@/components/dashboard/StatusIndicators";
import { RiskDashboard } from "@/components/dashboard/RiskDashboard";
import { motion } from "framer-motion";
import { useAccountData, usePositions, useTrades, useAlerts } from "@/hooks/use-dashboard-api";

const Index = () => {
  const { data: accountData } = useAccountData();
  const { data: positions } = usePositions();
  const { data: trades } = useTrades();
  const { data: alerts } = useAlerts();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Status Indicators */}
        <StatusIndicators />

        {/* Account Overview Cards */}
        <section>
          <AccountOverview data={accountData} />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart & Positions */}
          <div className="lg:col-span-2 space-y-6">
            <PnLChart data={trades} />
            <PositionsTable data={positions} />
          </div>

          {/* Right Column - Alerts & Risk */}
          <div className="space-y-6">
            <AlertPanel data={alerts} />
            <RiskDashboard data={accountData} />
          </div>
        </div>

        {/* Fund Slider */}
        <section>
          <FundSlider data={accountData} />
        </section>

        {/* Trade History - Full Width */}
        <section>
          <TradeHistory data={trades} />
        </section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-8 pb-4 text-center text-sm text-muted-foreground"
        >
          <p>RoboTrader v1.0 • Real-time data updates every 5 seconds</p>
          <p className="mt-1 text-xs opacity-60">
            Trading involves risk. Past performance does not guarantee future results.
          </p>
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;
