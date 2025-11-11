import { useState, useEffect } from 'react';
import config from '@/config';

interface GitHubRelease {
    tag_name: string;
    name: string;
    published_at: string;
}

export function useAppVersion() {
    const [version, setVersion] = useState<string>('0.1.0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVersion() {
            try {
                // Extract owner and repo from repoUrl
                const repoUrl = config.github.repoUrl;
                const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
                if (!match) {
                    // Fallback to package.json version
                    setVersion(config.app.version);
                    setLoading(false);
                    return;
                }

                const [, owner, repo] = match;

                // Fetch latest release
                const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                    },
                });

                if (response.ok) {
                    const release: GitHubRelease = await response.json();
                    // Extract version from tag (remove 'v' prefix if present)
                    const versionFromTag = release.tag_name.replace(/^v/, '');
                    setVersion(versionFromTag);
                } else if (response.status === 404) {
                    // No releases yet, try to get latest tag
                    const tagsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/tags?per_page=1`);
                    if (tagsResponse.ok) {
                        const tags = await tagsResponse.json();
                        if (Array.isArray(tags) && tags.length > 0) {
                            const versionFromTag = tags[0].name.replace(/^v/, '');
                            setVersion(versionFromTag);
                        } else {
                            // Fallback to package.json version
                            setVersion(config.app.version);
                        }
                    } else {
                        // Fallback to package.json version
                        setVersion(config.app.version);
                    }
                } else {
                    // Fallback to package.json version
                    setVersion(config.app.version);
                }
            } catch (error) {
                console.error('Failed to fetch version from GitHub:', error);
                // Fallback to package.json version
                setVersion(config.app.version);
            } finally {
                setLoading(false);
            }
        }

        fetchVersion();
    }, []);

    return { version, loading };
}

