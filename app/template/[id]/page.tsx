import { sql } from '@vercel/postgres';
import { notFound } from 'next/navigation';
import { Calendar, User, Eye, Download, Star, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Template {
  id: number;
  title: string;
  description: string;
  category: string;
  link: string;
  author: string;
  created_at: string;
  views: number;
  downloads: number;
  rating: number;
  html_content: string;
}
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const template = await getTemplate(params.id);
  
  if (!template) {
    return {
      title: 'Template Not Found | N8N Templates Gallery',
      description: 'The requested template could not be found.',
    };
  }

  return {
    title: `${template.title} - ${template.category} Template | N8N Workflow Gallery`,
    description: `${template.description} Download this ${template.category.toLowerCase()} workflow template for n8n automation.`,
    keywords: [
      template.title,
      template.category,
      'n8n workflow',
      'automation template',
      'workflow automation',
      template.category.toLowerCase() + ' automation'
    ].join(', '),
    openGraph: {
      title: template.title,
      description: template.description,
      type: 'article',
      url: `/template/${template.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: template.title,
      description: template.description,
    }
  };
}
async function getTemplate(id: string): Promise<Template | null> {
  try {
    const result = await sql`
      SELECT id, title, description, category, link, author, created_at,
             views, downloads, rating, html_content
      FROM templates 
      WHERE id = ${id} AND status = 'active'
    `;
    
    return result.rows[0] as Template || null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

export default async function TemplatePage({ params }: { params: { id: string } }) {
  const template = await getTemplate(params.id);
  
  if (!template) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Gallery
        </Link>
        
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{template.title}</h1>
              <p className="text-xl text-gray-600 leading-relaxed">{template.description}</p>
            </div>
            <div className="ml-8">
              <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {template.category}
              </span>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50 rounded-xl mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                <Eye className="w-6 h-6" />
                <span className="text-3xl font-bold">{formatNumber(template.views)}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Views</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                <Download className="w-6 h-6" />
                <span className="text-3xl font-bold">{template.downloads}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Downloads</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-yellow-600 mb-2">
                <Star className="w-6 h-6 fill-current" />
                <span className="text-3xl font-bold">{template.rating}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Rating</p>
            </div>
          </div>
          
          {/* Author & Date */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {template.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{template.author}</p>
                <p className="text-sm text-gray-600">Template Creator</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <p className="font-semibold text-gray-900">{formatDate(template.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div 
            className="prose prose-lg max-w-none text-gray-900
           [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:border-b [&_h2]:border-gray-300 [&_h2]:pb-3 [&_h2]:mb-6
           [&_p]:text-gray-800 [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:font-medium
           [&_ul]:space-y-3 [&_ul]:mb-6
           [&_ol]:space-y-3 [&_ol]:mb-6  
           [&_li]:text-gray-800 [&_li]:leading-relaxed [&_li]:font-medium
           [&_strong]:text-gray-900 [&_strong]:font-bold
           [&_a]:text-red-600 [&_a]:no-underline [&_a]:font-semibold hover:[&_a]:text-red-800"
            dangerouslySetInnerHTML={{ __html: template.html_content }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <a
            href={template.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            <ExternalLink className="w-6 h-6" />
            Open Template
          </a>
          <Link
            href="/"
            className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg"
          >
            Back to Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}