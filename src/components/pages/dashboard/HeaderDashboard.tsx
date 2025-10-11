"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function HeaderDashboard() {
  const [activeTab, setActiveTab] = useState<"portfolio" | "community">("portfolio");

  return (
    <div className="bg-card-bg w-full">
      <div className="px-8 py-6">
        {/* Header Title */}
        {/* <div className="mb-6">
          <h1 className="text-2xl font-semibold text-title mb-2">Portfolio Dashboard</h1>
        </div> */}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2">
          {/* Portfolio Tab */}
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              activeTab === "portfolio"
                ? "bg-accent text-white shadow-lg shadow-accent/30 scale-105"
                : "bg-white/80 text-description hover:bg-white hover:text-title"
            }`}
          >
            Portfolio
          </button>

          {/* Community Tab (Inactive) */}
          <div className="relative">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === "community"
                      ? "bg-accent text-white shadow-lg shadow-accent/30 scale-105"
                      : "bg-secondary-card text-description/60 opacity-70 hover:opacity-80"
                  }`}
                  disabled={activeTab !== "community"}
                >
                  Community
                  <Plus className="w-4 h-4" />
                </button>
              </DialogTrigger>

              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-accent">Create Community Space</DialogTitle>
                  <DialogDescription className="text-description mt-2">
                    This feature will create your community space where you can connect with others, share insights, and build
                    your network. All your current progress will be saved automatically before proceeding.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-6">
                  <Button
                    className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 rounded-full"
                    onClick={() => {
                      // TODO: Implement community creation logic
                      console.log("Creating community...");
                    }}
                  >
                    Create Community
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-secondary-card text-description hover:bg-secondary/50 py-3 rounded-full"
                  >
                    Learn More
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
