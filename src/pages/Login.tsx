import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in!");
      navigate("/dashboard");
    }
  };

  return (
    <Layout>
      <section className="py-20 flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-sm px-4">
          <h1 className="font-heading text-3xl font-bold text-center mb-2">
            <span className="text-gold-gradient">LOGIN</span>
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-8">Admin or Student access</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-border"
              required
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary border-border"
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading text-lg"
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </Button>
          </form>
          <p className="text-muted-foreground text-xs text-center mt-6">
            Student accounts are created by Admin only.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
