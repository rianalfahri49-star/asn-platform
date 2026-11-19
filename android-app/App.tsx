import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./src/lib/supabase";

type AuthMode = "login" | "signup";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [profileName, setProfileName] = useState("");
  const [planLabel, setPlanLabel] = useState("Reguler");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (AppState.currentState === "active") supabase.auth.startAutoRefresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfileName("");
      setPlanLabel("Reguler");
      return;
    }
    let cancelled = false;
    async function loadAccountSummary() {
      const [profileResult, subscriptionResult] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", session!.user.id).maybeSingle(),
        supabase.from("user_subscriptions").select("package_id,status,ends_at")
          .eq("user_id", session!.user.id).eq("status", "active")
          .gt("ends_at", new Date().toISOString()).order("ends_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (cancelled) return;
      setProfileName(profileResult.data?.full_name?.trim() ?? "");
      setPlanLabel(subscriptionResult.data ? "Premium" : "Reguler");
    }
    void loadAccountSummary();
    return () => { cancelled = true; };
  }, [session]);

  async function handleAuth() {
    setMessage("");
    if (!email.trim() || !password) {
      setMessage("Masukkan email dan kata sandi.");
      return;
    }
    if (password.length < 8) {
      setMessage("Kata sandi minimal 8 karakter.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (!data.session) {
          setMessage("Pendaftaran berhasil. Periksa email untuk konfirmasi akun sebelum masuk.");
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Autentikasi gagal. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setMessage(error?.message ?? "");
    setBusy(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.muted}>Memuat SuksesCPNS...</Text>
      </SafeAreaView>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.brand}>SuksesCPNS</Text>
        <Text style={styles.heading}>Konfigurasi belum lengkap</Text>
        <Text style={styles.body}>Isi EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY pada file .env lokal sebelum menjalankan aplikasi.</Text>
      </SafeAreaView>
    );
  }

  if (session) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>PLATFORM BELAJAR ASN</Text>
              <Text style={styles.brand}>SuksesCPNS</Text>
            </View>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(session.user.email ?? "S").slice(0, 1).toUpperCase()}</Text></View>
          </View>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>{profileName ? `Halo, ${profileName}!` : "Siap belajar hari ini?"}</Text>
            <Text style={styles.heroText}>Latihan terarah untuk mempersiapkan seleksi CPNS dan PPPK.</Text>
          </View>
          <Text style={styles.sectionTitle}>Akun kamu</Text>
          <View style={styles.panel}>
            <Text style={styles.label}>EMAIL</Text>
            <Text style={styles.accountEmail}>{session.user.email}</Text>\n            <Text style={styles.planPill}>Paket {planLabel}</Text>
            <Text style={styles.mutedSmall}>Akun terhubung ke SuksesCPNS.</Text>
          </View>
          <Text style={styles.sectionTitle}>Menu belajar</Text>
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>Materi belajar</Text>
            <Text style={styles.menuDescription}>Pelajari materi persiapan CPNS dan PPPK.</Text>
            <Text style={styles.comingSoon}>Modul aplikasi sedang disiapkan</Text>
          </View>
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>Latihan soal</Text>
            <Text style={styles.menuDescription}>Asah kemampuan melalui latihan soal.</Text>
            <Text style={styles.comingSoon}>Modul aplikasi sedang disiapkan</Text>
          </View>
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>Simulasi CAT</Text>
            <Text style={styles.menuDescription}>Persiapkan diri dengan simulasi ujian.</Text>
            <Text style={styles.comingSoon}>Modul aplikasi sedang disiapkan</Text>
          </View>
          <Pressable style={styles.secondaryButton} onPress={handleSignOut} disabled={busy}>
            <Text style={styles.secondaryButtonText}>{busy ? "Memproses..." : "Keluar akun"}</Text>
          </Pressable>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoMark}><Text style={styles.logoMarkText}>S</Text></View>
          <Text style={styles.brand}>SuksesCPNS</Text>
          <Text style={styles.heading}>{mode === "login" ? "Selamat datang kembali" : "Buat akun baru"}</Text>
          <Text style={styles.body}>Masuk untuk melanjutkan persiapan CPNS dan PPPK kamu.</Text>
          <View style={styles.form}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="nama@email.com" placeholderTextColor="#94A3B8" autoCapitalize="none" keyboardType="email-address" autoComplete="email" style={styles.input} />
            <Text style={styles.label}>KATA SANDI</Text>
            <TextInput value={password} onChangeText={setPassword} placeholder="Minimal 8 karakter" placeholderTextColor="#94A3B8" secureTextEntry autoComplete={mode === "login" ? "current-password" : "new-password"} style={styles.input} />
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <Pressable style={[styles.primaryButton, busy && styles.disabled]} onPress={handleAuth} disabled={busy}>
              {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>{mode === "login" ? "Masuk" : "Daftar"}</Text>}
            </Pressable>
            <Pressable style={styles.modeButton} onPress={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
              <Text style={styles.modeButtonText}>{mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}</Text>
            </Pressable>
          </View>
          <Text style={styles.footer}>SuksesCPNS bukan situs resmi pemerintah atau BKN.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", padding: 28, gap: 12 },
  content: { padding: 24, paddingBottom: 44 },
  authContent: { flexGrow: 1, justifyContent: "center", padding: 28, paddingBottom: 36 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  brand: { color: "#0F2747", fontSize: 28, fontWeight: "800", letterSpacing: -0.8 },
  eyebrow: { color: "#64748B", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 6 },
  logoMark: { width: 58, height: 58, borderRadius: 18, backgroundColor: "#0F2747", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  logoMarkText: { color: "#FFFFFF", fontSize: 30, fontWeight: "900" },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#1D4ED8", fontSize: 18, fontWeight: "800" },
  heading: { color: "#0F172A", fontSize: 23, lineHeight: 30, fontWeight: "800", marginTop: 28 },
  body: { color: "#64748B", fontSize: 14, lineHeight: 22, marginTop: 8, maxWidth: 360 },
  form: { marginTop: 30, gap: 12 },
  label: { color: "#475569", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginTop: 8 },
  input: { height: 52, borderRadius: 13, borderWidth: 1, borderColor: "#CBD5E1", backgroundColor: "#FFFFFF", paddingHorizontal: 15, color: "#0F172A", fontSize: 15 },
  primaryButton: { height: 52, borderRadius: 13, backgroundColor: "#1D4ED8", alignItems: "center", justifyContent: "center", marginTop: 8 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  secondaryButton: { height: 50, borderRadius: 13, borderWidth: 1, borderColor: "#CBD5E1", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginTop: 24 },
  secondaryButtonText: { color: "#0F2747", fontWeight: "800" },
  disabled: { opacity: 0.6 },
  modeButton: { alignItems: "center", padding: 12 },
  modeButtonText: { color: "#1D4ED8", fontWeight: "700", fontSize: 14 },
  message: { color: "#B45309", backgroundColor: "#FEF3C7", padding: 12, borderRadius: 10, fontSize: 13, lineHeight: 19, overflow: "hidden" },
  footer: { color: "#94A3B8", fontSize: 11, textAlign: "center", marginTop: 32, lineHeight: 17 },
  muted: { color: "#64748B", fontSize: 13 },
  mutedSmall: { color: "#94A3B8", fontSize: 12, marginTop: 6 },
  sectionTitle: { color: "#0F172A", fontSize: 17, fontWeight: "800", marginTop: 26, marginBottom: 12 },
  hero: { backgroundColor: "#0F2747", borderRadius: 20, padding: 22 },
  heroTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  heroText: { color: "#CBD5E1", fontSize: 13, lineHeight: 20, marginTop: 8 },
  panel: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", padding: 17 },
  accountEmail: { color: "#0F172A", fontSize: 15, fontWeight: "700", marginTop: 6 },
  planPill: { color: "#1D4ED8", backgroundColor: "#EFF6FF", alignSelf: "flex-start", overflow: "hidden", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, fontWeight: "800", marginTop: 10 },
  menuCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", padding: 18, marginBottom: 12 },
  menuTitle: { color: "#0F172A", fontSize: 16, fontWeight: "800" },
  menuDescription: { color: "#64748B", fontSize: 13, marginTop: 6, lineHeight: 19 },
  comingSoon: { color: "#1D4ED8", fontSize: 12, fontWeight: "700", marginTop: 12 },
});
