import React, { useState } from 'react';
import "~style.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader, Key, Globe, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService } from "~services"

function LoginView() {
  const { toast } = useToast()
  const [apiKeyLoading, setApiKeyLoading] = useState<boolean>(false);
  const [webLoading, setWebLoading] = useState<boolean>(false);
  const [key, setKey] = useState('');

  const onApiKeyLogin = async() => {
    if(!key){
      toast({description: chrome.i18n.getMessage("login_apikey") || "Please enter your API key",variant: "destructive"});
      return;
    }
    
    setApiKeyLoading(true);
    
    try {
      const result = await authService.loginWithApiKey(key);
      
      if (!result.success) {
        toast({description: result.error || "Login failed", variant: "destructive"});
      }
    } catch (error) {
      toast({description: "Login failed. Please try again.", variant: "destructive"});
    } finally {
      setTimeout(() => {
        setApiKeyLoading(false);
      }, 500);
    }
  };

  const onWebLogin = async() => {
    setWebLoading(true);
    
    try {
      const result = await authService.loginWithWeb();
      
      if (!result.success) {
        toast({description: result.error || "Web login failed", variant: "destructive"});
      }
    } catch (error) {
      toast({description: "Web login failed. Please try again.", variant: "destructive"});
    } finally {
      setWebLoading(false);
    }
  };

  const register = () => {
    window.open('https://www.posttonotion.com/login');
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKey(event.target.value);
  };

  
  return ( 
        <Card>
          <CardContent className="pt-8 mt-4 space-y-6">
              {/* Web Login Button */}
              <Button 
                className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors" 
                disabled={webLoading || apiKeyLoading}
                onClick={onWebLogin}
              >
                {webLoading && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
                <Globe className="mr-2 h-4 w-4" />
                {chrome.i18n.getMessage("login_web") || "Login with PostToNotion"}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    {chrome.i18n.getMessage("login_or") || "or"}
                  </span>
                </div>
              </div>

              {/* API Key Login */}
              <div className="space-y-4">
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder={chrome.i18n.getMessage("login_apikey") || "Enter your API key"} 
                    className="pl-10" 
                    onChange={handleInputChange}
                    disabled={webLoading || apiKeyLoading}
                  />
                </div>
                <Button 
                  className="w-full bg-black text-white hover:bg-gray-800" 
                  disabled={webLoading || apiKeyLoading}
                  onClick={onApiKeyLogin}
                >
                  {apiKeyLoading && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
                  {chrome.i18n.getMessage("login_login") || "Login with API Key"}                
                </Button>
              </div>

              {/* Register Link */}
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={register}
                disabled={webLoading || apiKeyLoading}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {chrome.i18n.getMessage("login_reg") || "Don't have an account? Register"}
              </Button>
          </CardContent>
        </Card>    
  );
  
}

export default LoginView
