import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, GraduationCap } from "lucide-react";

const SYNTHETIC_DOMAIN = "students.bjka.local";

const Login = () => {
  const [mode, setMode] = useState<"student" | "admin">("student");
  // Student fields
  const [rollNo, setRollNo] = useState("");
  const [dob, setDob] = useState("");
  // Admin fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const synthEmail = `${rollNo.trim().toLowerCase()}@${SYNTHETIC_DOMAIN}`;
    const { error } = await supabase.auth.signInWithPassword({ email: synthEmail, password: dob });
    setLoading(false);
    if (error) {
      toast.error("Invalid Roll No. or Date of Birth");
    } else {
      toast.success("Welcome back!");
      navigate("/student-profile");
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
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
          <p className="text-muted-foreground text-center text-sm mb-6">
            {mode === "student" ? "Student Portal" : "Admin Console"}
          </p>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-secondary rounded-lg">
            <button
              type="button"
              onClick={() => setMode("student")}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-heading transition-colors ${
                mode === "student" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <GraduationCap className="h-4 w-4" /> Student
            </button>
            <button
              type="button"
              onClick={() => setMode("admin")}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-heading transition-colors ${
                mode === "admin" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Shield className="h-4 w-4" /> Admin
            </button>
          </div>

          {mode === "student" ? (
            <form onSubmit={handleStudentLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1 block">Roll No.</label>
                <Input
                  placeholder="e.g. BJKA001"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="bg-secondary border-border uppercase"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1 block">Date of Birth</label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="bg-secondary border-border"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-crimson-dark text-primary-foreground font-heading text-lg"
              >
                {loading ? "Signing in..." : "SIGN IN"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
              <Input
                placeholder="Admin Email"
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
          )}

          <p className="text-muted-foreground text-xs text-center mt-6">
            {mode === "student"
              ? "Use the Roll No. given by your Sensei. Forgot? Ask your Sensei."
              : "Admin accounts are managed by the academy."}
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
