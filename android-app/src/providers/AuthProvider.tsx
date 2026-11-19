import React,{createContext,useContext,useEffect,useMemo,useState} from "react";
import {AppState,type AppStateStatus} from "react-native";
import type {Session} from "@supabase/supabase-js";
import {supabase,isSupabaseConfigured} from "../lib/supabase";
type AuthValue={session:Session|null;loading:boolean;configured:boolean};
const AuthContext=createContext<AuthValue|undefined>(undefined);
export function AuthProvider({children}:React.PropsWithChildren){
 const [session,setSession]=useState<Session|null>(null),[loading,setLoading]=useState(true);
 useEffect(()=>{
  if(!isSupabaseConfigured){setLoading(false);return;}
  let alive=true;
  void supabase.auth.getSession().then(({data,error})=>{if(!alive)return;if(error)console.warn(error.message);setSession(data.session);setLoading(false);});
  const {data:listener}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next);setLoading(false);});
  const onState=(state:AppStateStatus)=>state==="active"?supabase.auth.startAutoRefresh():supabase.auth.stopAutoRefresh();
  const sub=AppState.addEventListener("change",onState);onState(AppState.currentState);
  return()=>{alive=false;listener.subscription.unsubscribe();sub.remove();};
 },[]);
 const value=useMemo(()=>({session,loading,configured:isSupabaseConfigured}),[session,loading]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useSession(){const value=useContext(AuthContext);if(!value)throw new Error("useSession harus di dalam AuthProvider");return value;}
