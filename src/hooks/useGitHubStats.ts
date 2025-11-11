import { useEffect, useState } from 'react';
import config from '@/config';

interface GitHubStats {
  forks: number;
  commits: number;
  stars?: number;
}

interface UseGitHubStatsOptions {
  owner?: string;
  repo?: string;
}

export function useGitHubStats(options?: UseGitHubStatsOptions): {
  stats: GitHubStats | null;
  loading: boolean;
  error: string | null;
} {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        // Get repo info from config
        const repoUrl = config.github.repoUrl;
        const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        
        if (!urlMatch) {
          throw new Error('Invalid GitHub repository URL');
        }

        const owner = options?.owner || urlMatch[1];
        const repo = options?.repo || urlMatch[2].replace(/\.git$/, '');

        // Fetch repo info (includes forks and stars)
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
        });
        
        if (!repoResponse.ok) {
          const errorText = await repoResponse.text();
          console.error('GitHub API error:', repoResponse.status, errorText);
          throw new Error(`Failed to fetch repository info: ${repoResponse.status}`);
        }
        
        const repoData = await repoResponse.json();

        // For commits, fetch from default branch
        let commitsCount = 0;
        try {
          const defaultBranch = repoData.default_branch || 'main';
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&sha=${defaultBranch}`,
            {
              headers: {
                Accept: 'application/vnd.github.v3+json',
              },
            }
          );
          
          if (commitsResponse.ok) {
            const commitsData = await commitsResponse.json();
            commitsCount = commitsData.length;
            
            // Check if there are more commits by looking at Link header
            const linkHeader = commitsResponse.headers.get('Link');
            if (linkHeader && linkHeader.includes('rel="next"')) {
              // There are more commits, show "100+"
              commitsCount = 100;
            }
          } else {
            console.warn('Failed to fetch commits:', commitsResponse.status);
          }
        } catch (commitError) {
          // If commit fetch fails, just use 0
          console.warn('Failed to fetch commit count:', commitError);
        }

        setStats({
          forks: repoData.forks_count || 0,
          commits: commitsCount,
          stars: repoData.stargazers_count || 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch GitHub stats');
        // Set default values on error
        setStats({ forks: 0, commits: 0 });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [options?.owner, options?.repo]);

  return { stats, loading, error };
}
