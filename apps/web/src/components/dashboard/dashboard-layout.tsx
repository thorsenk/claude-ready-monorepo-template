'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Users,
  Trophy,
  TrendingUp,
  Calendar,
  Menu,
  X,
  Crown,
  Sword,
  Eye,
  Settings,
  Download,
  Star,
  Activity,
  Zap,
  Target,
  Award,
} from 'lucide-react';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: Eye, 
    description: 'League overview & key insights',
    color: 'text-blue-500',
    badge: 'Live'
  },
  { 
    name: 'Team Analysis', 
    href: '/teams', 
    icon: Users, 
    description: 'Individual team deep-dive',
    color: 'text-emerald-500'
  },
  { 
    name: 'Head-to-Head', 
    href: '/head-to-head', 
    icon: Sword, 
    description: 'Team matchup analysis',
    color: 'text-orange-500'
  },
  { 
    name: 'Championships', 
    href: '/championships', 
    icon: Crown, 
    description: 'Championship history & playoffs',
    color: 'text-yellow-500',
    badge: 'Elite'
  },
  { 
    name: 'Season Stats', 
    href: '/seasons', 
    icon: Calendar, 
    description: 'Historical season analysis',
    color: 'text-purple-500'
  },
  { 
    name: 'Performance', 
    href: '/performance', 
    icon: TrendingUp, 
    description: 'Advanced performance metrics',
    color: 'text-cyan-500',
    badge: 'Pro'
  },
];

const secondaryNavigation = [
  { name: 'Leaderboards', href: '/leaderboards', icon: Star, color: 'text-amber-500' },
  { name: 'Analytics Hub', href: '/analytics', icon: Activity, color: 'text-indigo-500' },
  { name: 'Export Data', href: '/export', icon: Download, color: 'text-slate-500' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-500' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="h-screen flex bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Enhanced Header */}
        <div className="relative h-20 px-6 border-b border-border/30 fantasy-gradient overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          
          <div className="relative flex items-center justify-between h-full">
            <div className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                <div className="relative flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 group-hover:scale-105 transition-transform duration-300">
                  <Trophy className="h-7 w-7 text-white animate-float" />
                </div>
              </div>
              <div className="ml-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-white tracking-tight">
                    RFFL Analytics
                  </span>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none shadow-lg trophy-badge">
                    Elite
                  </Badge>
                </div>
                <p className="text-white/70 text-sm font-medium">Professional League Management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Enhanced Main Navigation */}
        <nav className="mt-8 px-4 flex-1 overflow-y-auto">
          <div className="space-y-3">
            <div className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
              <Activity className="h-3 w-3" />
              Analytics Suite
            </div>
            
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'nav-link group relative flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-300 hover:translate-x-1',
                    isActive
                      ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-primary border-l-3 border-primary shadow-lg'
                      : 'text-muted-foreground hover:bg-gradient-to-r hover:from-muted/50 hover:to-transparent hover:text-foreground'
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-lg mr-4 transition-all duration-300 group-hover:scale-110',
                    isActive 
                      ? 'bg-primary/10 shadow-lg' 
                      : 'bg-muted/50 group-hover:bg-muted'
                  )}>
                    <item.icon
                      className={cn(
                        'h-5 w-5 transition-all duration-300',
                        isActive 
                          ? cn('text-primary', item.color) 
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{item.name}</span>
                      {item.badge && (
                        <Badge 
                          variant={isActive ? "default" : "secondary"} 
                          className={cn(
                            "text-xs px-2 py-0.5 font-medium",
                            isActive 
                              ? "bg-primary/20 text-primary border-primary/30" 
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5 group-hover:text-foreground/70 transition-colors">
                      {item.description}
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Enhanced Secondary Navigation */}
          <div className="mt-8 pt-6 border-t border-border/30 space-y-2">
            <div className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap className="h-3 w-3" />
              Power Tools
            </div>
            
            {secondaryNavigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'nav-link group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 hover:translate-x-1',
                    isActive
                      ? 'bg-gradient-to-r from-secondary/10 to-transparent text-secondary border-l-2 border-secondary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                  style={{
                    animationDelay: `${(navigation.length + index) * 100}ms`
                  }}
                >
                  <div className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-md mr-3 transition-all duration-300',
                    isActive ? 'bg-secondary/10' : 'group-hover:bg-muted'
                  )}>
                    <item.icon
                      className={cn(
                        'h-4 w-4 transition-colors duration-300',
                        isActive 
                          ? cn('text-secondary', item.color) 
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                  </div>
                  <span className="font-medium">{item.name}</span>
                  
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-secondary rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Enhanced League Info Footer */}
        <div className="mt-auto p-4 border-t border-border/30">
          <div className="relative bg-gradient-to-r from-muted/80 via-muted/50 to-muted/80 rounded-xl p-4 backdrop-blur-sm border border-border/20 shadow-lg overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-tertiary/5 animate-pulse"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-30"></div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">League Status</span>
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs border-none">
                  Active
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Data Range</span>
                  <span className="text-foreground font-semibold">2018-2024</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Total Seasons</span>
                  <span className="text-foreground font-semibold">7</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Records</span>
                  <span className="text-foreground font-semibold">13,478+</span>
                </div>
                <div className="pt-2 border-t border-border/20">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Target className="h-3 w-3" />
                    <span>Updated {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-border/30 bg-gradient-to-r from-card via-card/95 to-card backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg shadow-sm">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gradient">RFFL Analytics</span>
              <span className="text-xs text-muted-foreground">Elite Dashboard</span>
            </div>
          </div>
          
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Enhanced Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
          <div className={cn(
            "min-h-full transition-all duration-300 opacity-100",
            mounted ? "animate-slide-up" : ""
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}