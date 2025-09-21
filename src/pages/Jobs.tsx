import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Briefcase, Clock, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const jobTypes = ["All Jobs", "Full-time", "Part-time", "Remote", "Contract", "Internship"];

const jobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120,000 - $150,000",
    postedDate: "2 days ago",
    description: "We're looking for a senior frontend developer to join our team and help build amazing user experiences.",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=926&q=80",
    isRemote: false,
    isFeatured: true
  },
  {
    id: 2,
    title: "Product Manager",
    company: "StartupXYZ",
    location: "New York, NY",
    type: "Full-time",
    salary: "$90,000 - $120,000",
    postedDate: "1 week ago",
    description: "Join our fast-growing startup as a Product Manager and help shape the future of our platform.",
    logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
    isRemote: true,
    isFeatured: false
  },
  {
    id: 3,
    title: "UX/UI Designer",
    company: "Design Studio",
    location: "Los Angeles, CA",
    type: "Contract",
    salary: "$70 - $90 per hour",
    postedDate: "3 days ago",
    description: "Create beautiful and intuitive designs for our clients' digital products and applications.",
    logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2239&q=80",
    isRemote: false,
    isFeatured: false
  },
  {
    id: 4,
    title: "Data Scientist",
    company: "AI Solutions Ltd",
    location: "Remote",
    type: "Full-time",
    salary: "$100,000 - $130,000",
    postedDate: "5 days ago",
    description: "Work with large datasets and machine learning algorithms to drive business insights.",
    logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    isRemote: true,
    isFeatured: true
  },
  {
    id: 5,
    title: "Marketing Specialist",
    company: "Growth Agency",
    location: "Chicago, IL",
    type: "Part-time",
    salary: "$25 - $35 per hour",
    postedDate: "1 day ago",
    description: "Help our clients grow their businesses through innovative marketing strategies.",
    logo: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
    isRemote: false,
    isFeatured: false
  },
  {
    id: 6,
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$110,000 - $140,000",
    postedDate: "4 days ago",
    description: "Manage our cloud infrastructure and help scale our applications globally.",
    logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    isRemote: true,
    isFeatured: false
  }
];

const Jobs = () => {
  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Opportunities</h1>
          <p className="text-muted-foreground">Find your next career opportunity</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search jobs, companies, or keywords..."
                className="pl-10"
              />
            </div>
            <div className="relative min-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Location"
                className="pl-10"
              />
            </div>
            <Button>Search Jobs</Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {jobTypes.map((type, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={job.logo}
                      alt={job.company}
                      className="w-full h-full object-cover"
                    />
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
                          {job.isFeatured && (
                            <Badge className="bg-warning">Featured</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground text-sm">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {job.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                            {job.isRemote && (
                              <Badge variant="secondary" className="ml-1 text-xs">
                                Remote
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.postedDate}
                          </div>
                        </div>
                      </div>
                      <Button>Apply Now</Button>
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
                        <span className="font-semibold text-success">
                          {job.salary}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Jobs;