import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Smartphone, 
  Mail,
  Save,
  Trash2
} from "lucide-react";

const Settings = () => {
  return (
    <MainLayout>
      <div className="space-y-6 ml-20  p-5 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account preferences</p>
          </div>
          <Button className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>

        {/* Account Settings */}
        <div className="social-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Account Settings</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-4 py-2 bg-muted rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Username
                </label>
                <input
                  type="text"
                  defaultValue="johndoe"
                  className="w-full px-4 py-2 bg-muted rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="john.doe@example.com"
                className="w-full px-4 py-2 bg-muted rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Bio
              </label>
              <textarea
                rows={3}
                defaultValue="Frontend Developer passionate about creating amazing user experiences."
                className="w-full px-4 py-2 bg-muted rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="social-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Privacy & Security</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Profile Visibility</h4>
                <p className="text-sm text-muted-foreground">Control who can see your profile</p>
              </div>
              <select className="px-3 py-2 bg-muted rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none">
                <option>Everyone</option>
                <option>Friends Only</option>
                <option>Private</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Show Online Status</h4>
                <p className="text-sm text-muted-foreground">Let others see when you're online</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">Add extra security to your account</p>
              </div>
              <Button variant="outline" size="sm">
                Enable 2FA
              </Button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="social-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-foreground">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-foreground">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Friend Requests</h4>
                <p className="text-sm text-muted-foreground">Get notified of new friend requests</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Post Interactions</h4>
                <p className="text-sm text-muted-foreground">Likes, comments, and shares on your posts</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Data & Storage */}
        <div className="social-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Data & Storage</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Download Your Data</h4>
                <p className="text-sm text-muted-foreground">Get a copy of all your data</p>
              </div>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Storage Used</h4>
                <p className="text-sm text-muted-foreground">2.4 GB of 5 GB used</p>
              </div>
              <div className="w-32 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{width: '48%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="social-card p-6 border-destructive/20">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-6 h-6 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Deactivate Account</h4>
                <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
              </div>
              <Button variant="destructive" size="sm">
                Deactivate
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Delete Account</h4>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;