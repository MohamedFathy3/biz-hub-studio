import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Building2, 
  DollarSign, 
  Users, 
  Calendar,
  Share2,
  Heart,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Fetch job details from API
  const fetchJobDetail = async () => {
    try {
      const res = await api.get(`/job/${id}`);
      setJob(res.data.data || res.data.message?.job);
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobDetail();
    }
  }, [id]);

  // Handle job application
  const handleApply = async () => {
    if (!coverLetter.trim()) {
      alert("Please write a cover letter");
      return;
    }

    setApplying(true);
    try {
      await api.post(`/jobs/${id}/apply`, {
        cover_letter: coverLetter
      });
      setApplySuccess(true);
      setApplyModalOpen(false);
      setCoverLetter("");
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Failed to apply for job");
    } finally {
      setApplying(false);
    }
  };

  // Format responsibilities, requirements, and benefits from string to array
  const formatListItems = (text: string) => {
    if (!text) return [];
    return text.split('\n').filter(item => item.trim() !== '');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <Link to="/jobs">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const responsibilities = formatListItems(job.responsibilities);
  const requirements = formatListItems(job.requirements);
  const benefits = formatListItems(job.benefits);

  return (
    <MainLayout>
      <div className="p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>

        {applySuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Application Submitted!</p>
              <p className="text-sm text-green-600">Your application has been sent successfully.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      {job.company?.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-bold">{job.title}</h1>
                        {job.available && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.company?.name || job.clinck}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="font-semibold">${job.salary}</div>
                    <div className="text-sm text-muted-foreground">Salary</div>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <Briefcase className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="font-semibold">{job.type}</div>
                    <div className="text-sm text-muted-foreground">Job Type</div>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <Users className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                    <div className="font-semibold">{job.applications_count || 0}</div>
                    <div className="text-sm text-muted-foreground">Applicants</div>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold">
                      {job.created_at ? new Date(job.created_at).toLocaleDateString() : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">Posted</div>
                  </div>
                </div>

                <Separator />

                {/* Job Description */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Job Description</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>

                <Separator />

                {/* Responsibilities */}
                {responsibilities.length > 0 && (
                  <>
                    <div>
                      <h2 className="text-xl font-semibold mb-3">Key Responsibilities</h2>
                      <ul className="space-y-2">
                        {responsibilities.map((responsibility: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-muted-foreground">{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Requirements */}
                {requirements.length > 0 && (
                  <>
                    <div>
                      <h2 className="text-xl font-semibold mb-3">Requirements</h2>
                      <ul className="space-y-2">
                        {requirements.map((requirement: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-muted-foreground">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Benefits */}
                {benefits.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Benefits & Perks</h2>
                    <ul className="space-y-2">
                      {benefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Apply Card */}
            <Card>
              <CardContent className="p-6">
                <Button 
                  className="w-full mb-4" 
                  size="lg"
                  onClick={() => setApplyModalOpen(true)}
                  disabled={!job.available}
                >
                  {job.available ? "Apply for this Job" : "Not Available"}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  {job.available 
                    ? "Apply now to join an amazing team" 
                    : "This position is currently not available"
                  }
                </p>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {job.company?.name || job.clinck}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.company?.size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company Size</span>
                    <span className="font-medium">{job.company.size}</span>
                  </div>
                )}
                {job.company?.industry && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium">{job.company.industry}</span>
                  </div>
                )}
                {job.company?.founded && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Founded</span>
                    <span className="font-medium">{job.company.founded}</span>
                  </div>
                )}
                {job.company?.website && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Website</span>
                    <a 
                      href={job.company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {job.company.website}
                    </a>
                  </div>
                )}
                {job.company?.location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{job.company.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Frontend Developer</h4>
                      <p className="text-sm text-muted-foreground">StartupXYZ</p>
                      <p className="text-sm text-green-600">$80k - $100k</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cover Letter</label>
              <Textarea
                placeholder="Why are you interested in this position? What makes you a good fit?"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? "Applying..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default JobDetail;