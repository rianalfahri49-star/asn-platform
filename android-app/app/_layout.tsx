import React,{useEffect} from "react";
import {ActivityIndicator,Text,View} from "react-native";
import {Stack,useRouter,useSegments} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {AuthProvider,useSession} from "../src/providers/AuthProvider";
function Guard(){
 const {session,loading,configured}=useSession(),segments=useSegments(),router=useRouter();
 const first=segments[0],second=segments[1];
 useEffect(()=>{
  if(loading)return;
  if(first==="(auth)"&&(second==="reset-password"||second==="confirm-email"))return;
  if(!session){if(first==="(auth)"&&second==="verify-email")return;router.replace("/(auth)/login");return;}
  if(!session.user.email_confirmed_at){if(first!=="(auth)"||second!=="verify-email")router.replace("/(auth)/verify-email");return;}
  if(first!=="(app)")router.replace("/(app)");
 },[first,second,loading,session,router]);
 if(loading)return <View style={{flex:1,justifyContent:"center",alignItems:"center"}}><ActivityIndicator/><Text>Memuat SuksesCPNS...</Text></View>;
 if(!configured)return <View style={{flex:1,justifyContent:"center",padding:28}}><Text style={{fontSize:22,fontWeight:"800"}}>Konfigurasi belum lengkap</Text><Text>Isi EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY pada .env.</Text></View>;
 return <><StatusBar style="dark"/><Stack screenOptions={{headerShown:false}}/></>;
}
export default function RootLayout(){return <AuthProvider><Guard/></AuthProvider>;}
