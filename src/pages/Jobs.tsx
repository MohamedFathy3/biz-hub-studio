// pages/Jobs.tsx
import { useState, useEffect, useContext } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Briefcase, Clock, Building2, Plus, User, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import FileUploader from "@/components/ImageUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AuthContext } from "@/Context/AuthContext";

const jobTypes = ["All Jobs", "Full-time", "Part-time", "Remote", "Contract", "Internship"];

const Jobs = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Jobs");

  // Form state for new job - التصحيح: البيانات بتكون nested في company
  const [newJob, setNewJob] = useState({
    title: "",
    location: "",
    type: "Full-time",
    salary: "",
    image: null as number | null,
    available: true,
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    company: {
      name: "",
      size: "",
      industry: "",
      founded: "",
      website: "",
      location: ""
    }
  });

  // Fetch jobs from API
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.post("/job/index", {
        filters: {  "active":1},
        orderBy: "id",
        orderByDirection: "asc",
        perPage,
        paginate: true,
        deleted: false,
        page,
      });
      console.log("🔍 Jobs data:", res.data);
      setJobs(res.data.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle image upload
  const handleImageUpload = (id: number) => {
    setNewJob(prev => ({ ...prev, image: id }));
  };

  // Handle company field changes
  const handleCompanyChange = (field: string, value: string) => {
    setNewJob(prev => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value
      }
    }));
  };

  // Create new job - التصحيح: البيانات بتكون nested
  const handleCreateJob = async () => {
    try {
      // 🔥 نجهز البيانات بالشكل اللي الـ API بيتوقعه
      const jobData = {
        title: newJob.title,
        location: newJob.location,
        type: newJob.type,
        salary: newJob.salary,
        image: newJob.image,
        available: newJob.available,
        description: newJob.description,
        responsibilities: newJob.responsibilities,
        requirements: newJob.requirements,
        benefits: newJob.benefits,
        company_name: newJob.company.name, // 🔥 نرسل ك flat fields
        company_size: newJob.company.size,
        company_industry: newJob.company.industry,
        company_founded: newJob.company.founded,
        company_website: newJob.company.website,
        company_location: newJob.company.location
      };

      console.log("📤 Sending job data:", jobData);
      
      const response = await api.post("/job", jobData);
      console.log("✅ Job created:", response.data);
      
      setModalOpen(false);
      fetchJobs();
      
      // Reset form
      setNewJob({
        title: "",
        location: "",
        type: "Full-time",
        salary: "",
        image: null,
        available: true,
        description: "",
        responsibilities: "",
        requirements: "",
        benefits: "",
        company: {
          name: "",
          size: "",
          industry: "",
          founded: "",
          website: "",
          location: ""
        }
      });
      
      alert("Job posted successfully! ✅");
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job.");
    }
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || 
                           job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesType = typeFilter === "All Jobs" || job.type === typeFilter;

    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Job Opportunities</h1>
            <p className="text-muted-foreground">Find your next career opportunity</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Post Job
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search jobs, companies, or keywords..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative min-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Location"
                className="pl-10"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            <Button onClick={fetchJobs}>Search Jobs</Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {jobTypes.map((type, index) => (
              <Button
                key={index}
                variant={typeFilter === type ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setTypeFilter(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {job.image_full_url ? (
                        <img
                          src={job.image_full_url}
                          alt={job.company?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Link 
                              to={`/jobs/${job.id}`}
                              className="text-xl font-semibold hover:text-primary transition-colors"
                            >
                              {job.title}
                            </Link>
                            {job.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Featured</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-muted-foreground text-sm">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {job.company?.name || "Unknown Company"}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                              {job.type === "Remote" && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                  Remote
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently"}
                            </div>
                          </div>
                        </div>
                      
                      </div>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {job.type}
                          </Badge>
                          <span className="font-semibold text-green-600">
                            ${job.salary}
                          </span>
                        </div>
                        {job.applications_count > 0 && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {job.applications_count} applications
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No jobs found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Job Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post New Job</DialogTitle>
            <DialogDescription>
              Fill in the details below to post a new job opportunity.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Job Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Job Title *"
                value={newJob.title}
                onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <Input
                placeholder="Job Location *"
                value={newJob.location}
                onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>

            <Select
              value={newJob.type}
              onValueChange={(value) => setNewJob(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Job Type *" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Salary *"
              value={newJob.salary}
              onChange={(e) => setNewJob(prev => ({ ...prev, salary: e.target.value }))}
              required
            />

            {/* Company Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Company Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Company Name *"
                  value={newJob.company.name}
                  onChange={(e) => handleCompanyChange("name", e.target.value)}
                  required
                />
                <Input
                  placeholder="Company Size"
                  value={newJob.company.size}
                  onChange={(e) => handleCompanyChange("size", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Input
                  placeholder="Industry"
                  value={newJob.company.industry}
                  onChange={(e) => handleCompanyChange("industry", e.target.value)}
                />
                <Input
                  placeholder="Founded Year"
                  value={newJob.company.founded}
                  onChange={(e) => handleCompanyChange("founded", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Input
                  placeholder="Website"
                  value={newJob.company.website}
                  onChange={(e) => handleCompanyChange("website", e.target.value)}
                />
                <Input
                  placeholder="Company Location"
                  value={newJob.company.location}
                  onChange={(e) => handleCompanyChange("location", e.target.value)}
                />
              </div>
            </div>

            {/* Job Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Job Details</h3>
              <Textarea
                placeholder="Job Description *"
                value={newJob.description}
                onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
              />
              <Textarea
                placeholder="Responsibilities"
                value={newJob.responsibilities}
                onChange={(e) => setNewJob(prev => ({ ...prev, responsibilities: e.target.value }))}
                rows={2}
                className="mt-3"
              />
              <Textarea
                placeholder="Requirements"
                value={newJob.requirements}
                onChange={(e) => setNewJob(prev => ({ ...prev, requirements: e.target.value }))}
                rows={2}
                className="mt-3"
              />
              <Textarea
                placeholder="Benefits"
                value={newJob.benefits}
                onChange={(e) => setNewJob(prev => ({ ...prev, benefits: e.target.value }))}
                rows={2}
                className="mt-3"
              />
            </div>

            {/* Image Upload */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Company Logo</h3>
              <FileUploader
                label="Upload Company Logo"
                onUploadSuccess={handleImageUpload}
                multiple={false}
                accept="image/*"
                preview={true}
              />
              {newJob.image && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Logo uploaded successfully
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateJob}
              disabled={!newJob.title || !newJob.location || !newJob.salary || !newJob.company.name || !newJob.description}
            >
              Post Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Jobs;