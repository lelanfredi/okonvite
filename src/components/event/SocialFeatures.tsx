import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Share2, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

interface SocialFeaturesProps {
  onShare?: (platform: string) => void;
  points?: number;
  isShared?: boolean;
}

const SocialFeatures = ({
  onShare = () => {},
  points = 10,
  isShared = false,
}: SocialFeaturesProps) => {
  return (
    <Card className="p-6 bg-white w-full max-w-[1000px]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Social Features</h3>
            <p className="text-sm text-gray-500">
              Share your event and earn points
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-full">
              {points} Points Earned
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-share">Auto-share to social media</Label>
            <Switch id="auto-share" />
          </div>

          <div className="space-y-2">
            <Label>Share on social platforms</Label>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10"
                onClick={() => onShare("facebook")}
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10"
                onClick={() => onShare("twitter")}
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10"
                onClick={() => onShare("linkedin")}
              >
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10"
                onClick={() => onShare("instagram")}
              >
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Button
              className="w-full"
              onClick={() => onShare("all")}
              disabled={isShared}
            >
              <Share2 className="mr-2 h-4 w-4" />
              {isShared ? "Event Shared" : "Share Event"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SocialFeatures;
