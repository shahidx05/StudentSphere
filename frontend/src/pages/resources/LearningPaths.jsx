import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { PageSpinner } from '../../components/ui/Spinner';
import { ExternalLink, ChevronDown, ChevronUp, Code2, Brain, BarChart3, Cloud, Cpu } from 'lucide-react';

const ICONS = { 'web-development': Code2, 'artificial-intelligence': Brain, 'dsa': BarChart3, 'cloud-devops': Cloud, 'gate': Cpu };

const LearningPaths = () => {
  const { data, loading } = useFetch('/api/resources/learning-paths');
  const [expanded, setExpanded] = useState(null);
  const paths = data?.data || [];

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-header">Learning Paths</h1>
        <p className="text-text-muted text-sm">Curated roadmaps for your tech journey</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {paths.map((path) => {
          const Icon = ICONS[path.slug] || Code2;
          const isOpen = expanded === path.slug;
          return (
            <div key={path.slug} className="card-base card-glow cursor-pointer"
              onClick={() => setExpanded(isOpen ? null : path.slug)}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-text-primary">{path.title}</h3>
                    {isOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                  </div>
                  <p className="text-text-muted text-sm mt-1">{path.description}</p>
                </div>
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                  <div>
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Topics Covered</p>
                    <div className="flex flex-wrap gap-1.5">
                      {path.topics?.map((t) => (
                        <span key={t} className="badge-base bg-surface-2 text-text-secondary border border-border text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Platforms & Resources</p>
                    <div className="space-y-1.5">
                      {path.platforms?.map((p) => (
                        <a key={p.name} href={p.url} target="_blank" rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 text-primary text-sm hover:text-primary-light transition-colors">
                          <ExternalLink size={12} />
                          {p.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPaths;
