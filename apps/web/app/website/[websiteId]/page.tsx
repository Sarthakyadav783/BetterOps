import WebsiteDetailPage from "@/components/ActionPage";

type PageProps = {
  params: Promise<{ websiteId: string }>;
};

async function WebsitePage({ params }: PageProps) {
  const { websiteId } = await params;

  return (
    <div className="h-full w-full">
      <WebsiteDetailPage websiteId={websiteId} />
    </div>
  );
}

export default WebsitePage;