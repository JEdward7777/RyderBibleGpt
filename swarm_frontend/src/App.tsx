import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/ui/card';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';
import { Input } from './components/ui/input';
import { cn } from './lib/utils';

interface Scenario {
  id: string;
  filename: string;
  source_lang: string;
  source_label: string;
  target_lang: string;
  target_label: string;
}

interface Manifest {
  scenarios: Scenario[];
}

const App = () => {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadManifest = async () => {
      try {
        const response = await fetch('/manifest.json');
        if (!response.ok) {
          throw new Error('Failed to fetch manifest');
        }
        const data: Manifest = await response.json();
        setScenarios(data.scenarios);
      } catch (err) {
        console.error('Error loading manifest:', err);
      }
    };
    loadManifest();
  }, []);

  const filteredScenarios = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return scenarios;

    return scenarios.filter((scenario) => {
      return (
        scenario.source_lang.toLowerCase().includes(query) ||
        scenario.target_lang.toLowerCase().includes(query) ||
        scenario.source_label.toLowerCase().includes(query) ||
        scenario.target_label.toLowerCase().includes(query)
      );
    });
  }, [scenarios, searchQuery]);

  const handleScenarioClick = (scenario: Scenario) => {
    navigate(`/translation/${scenario.id}`, { state: scenario });
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <Card className="container mx-auto max-w-4xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Bible Translation Projects</CardTitle>
          <CardDescription>
            Select a translation project to review and edit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Search by language code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Separator className="my-2" />
            <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
              <div className="grid grid-cols-1 gap-4">
                {filteredScenarios.length === 0 ? (
                  <p className="text-muted-foreground py-4">
                    {scenarios.length === 0
                      ? 'No translation projects found'
                      : 'No matches found for your search'}
                  </p>
                ) : (
                  filteredScenarios.map((scenario) => (
                    <Card
                      key={scenario.id}
                      className={cn(
                        'transition-all hover:shadow-md cursor-pointer',
                        'border hover:border-primary/50',
                        'bg-card/50 hover:bg-card'
                      )}
                      onClick={() => handleScenarioClick(scenario)}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <span className="font-medium text-primary">
                                {scenario.source_label}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium text-primary">
                                {scenario.target_label}
                              </span>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 text-xs">
                              <code className="px-1 py-0.5 rounded bg-muted">
                                {scenario.source_lang}
                              </code>
                              <span className="text-muted-foreground">to</span>
                              <code className="px-1 py-0.5 rounded bg-muted">
                                {scenario.target_lang}
                              </code>
                            </CardDescription>
                          </div>
                          <div className="text-muted-foreground/50 hover:text-primary transition-colors">
                            →
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
