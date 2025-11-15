import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../component/ui/button";
import { Wallet, TrendingUp, Sparkles, ArrowRight } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/10 p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-primary p-6 rounded-3xl shadow-glow">
            <Wallet className="h-16 w-16 text-primary-foreground" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Saku Pintar
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Kelola keuangan pribadi Anda dengan cerdas menggunakan AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-card p-6 rounded-xl shadow-md border border-border">
            <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Tracking Otomatis</h3>
            <p className="text-sm text-muted-foreground">
              Catat pemasukan dan pengeluaran dengan mudah
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-md border border-border">
            <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">AI Insights</h3>
            <p className="text-sm text-muted-foreground">
              Dapatkan rekomendasi keuangan dari AI
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-md border border-border">
            <Wallet className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Visualisasi Data</h3>
            <p className="text-sm text-muted-foreground">
              Lihat pengeluaran Anda dalam grafik yang mudah dipahami
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button
            size="lg"
            className="bg-gradient-primary shadow-glow text-lg px-8"
            onClick={() => navigate("/auth")}
          >
            Mulai Sekarang
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
