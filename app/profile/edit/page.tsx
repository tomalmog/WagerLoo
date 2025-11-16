"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    program: "",
    year: "",
    bio: "",
    previousCoops: "",
    profilePicture: "",
    resumeUrl: "",
  });
  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewResume, setPreviewResume] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, profilePicture: base64String });
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, profilePicture: url });
    setPreviewImage(url);
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, resumeUrl: base64String });
        setPreviewResume(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUrlChange = (url: string) => {
    setFormData({ ...formData, resumeUrl: url });
    setPreviewResume(url);
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || "",
          program: data.program || "",
          year: data.year || "",
          bio: data.bio || "",
          previousCoops: data.previousCoops || "",
          profilePicture: data.profilePicture || "",
          resumeUrl: data.resumeUrl || "",
        });
        setPreviewImage(data.profilePicture || "");
        setPreviewResume(data.resumeUrl || "");
      } else if (response.status === 404) {
        // No profile exists yet, redirect to create
        router.push("/profile/create");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        router.push("/profile");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground font-light">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12 dot-grid">
        <div className="max-w-2xl mx-auto px-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-light">Edit Your Profile</CardTitle>
              <CardDescription className="font-light">
                Update your information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-light text-muted-foreground">
                    Profile Picture
                  </label>
                  <div className="flex flex-col gap-4">
                    {previewImage && (
                      <div className="flex justify-center">
                        <img
                          src={previewImage}
                          alt="Profile preview"
                          className="w-32 h-32 rounded-full object-cover border-2 border-border"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="font-light"
                      />
                      <div className="text-xs text-muted-foreground font-light text-center">
                        or
                      </div>
                      <Input
                        type="url"
                        placeholder="Paste image URL"
                        value={formData.profilePicture.startsWith('data:') ? '' : formData.profilePicture}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        className="font-light"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-light text-muted-foreground">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="font-light"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="program" className="text-sm font-light text-muted-foreground">
                    Program
                  </label>
                  <Input
                    id="program"
                    type="text"
                    placeholder="Computer Science"
                    value={formData.program}
                    onChange={(e) =>
                      setFormData({ ...formData, program: e.target.value })
                    }
                    required
                    className="font-light"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="year" className="text-sm font-light text-muted-foreground">
                    Year
                  </label>
                  <Input
                    id="year"
                    type="text"
                    placeholder="3A"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    required
                    className="font-light"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-light text-muted-foreground">
                    Bio (optional)
                  </label>
                  <textarea
                    id="bio"
                    className="flex min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-light placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Tell us about yourself, your skills, interests, etc."
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="previousCoops" className="text-sm font-light text-muted-foreground">
                    Previous Co-ops (optional)
                  </label>
                  <textarea
                    id="previousCoops"
                    className="flex min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-light placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="List your previous co-op experiences (e.g., 'Google - $45/hr, Amazon - $50/hr')"
                    value={formData.previousCoops}
                    onChange={(e) =>
                      setFormData({ ...formData, previousCoops: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-light text-muted-foreground">
                    Resume
                  </label>
                  <div className="flex flex-col gap-4">
                    {previewResume && (
                      <div className="flex justify-center">
                        <img
                          src={previewResume}
                          alt="Resume preview"
                          className="w-full max-w-md border rounded-lg"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleResumeUpload}
                        className="font-light"
                      />
                      <div className="text-xs text-muted-foreground font-light text-center">
                        or
                      </div>
                      <Input
                        type="url"
                        placeholder="Paste resume image URL"
                        value={formData.resumeUrl.startsWith('data:') ? '' : formData.resumeUrl}
                        onChange={(e) => handleResumeUrlChange(e.target.value)}
                        className="font-light"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 font-light"
                    onClick={() => router.push("/")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 font-light" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
