import { useState, useEffect } from "react";
import {
  LexiconEntry,
  MorphologyState,
  PhonologyConfig,
  SoundChangeRule,
  ProjectConstraints,
  ScriptConfig,
  ProjectData,
} from "../types";

const STORAGE_KEY = "conlang_studio_autosave";

const INITIAL_CONSTRAINTS_TEMPLATE: ProjectConstraints = {
  allowDuplicates: true,
  caseSensitive: false,
  bannedSequences: [],
  allowedGraphemes: "",
  phonotacticStructure: "",
  mustStartWith: [],
  mustEndWith: [],
};

const INITIAL_SCRIPT_CONFIG: ScriptConfig = {
  name: "Standard Script",
  direction: "ltr",
  glyphs: [],
  spacingMode: "proportional",
};

export const useProject = () => {
  const [projectName, setProjectName] = useState("Untitled");
  const [projectAuthor, setProjectAuthor] = useState("Unknown");
  const [projectDescription, setProjectDescription] = useState("");
  const [lexicon, setLexicon] = useState<LexiconEntry[]>([]);
  const [grammar, setGrammar] = useState("");
  const [morphology, setMorphology] = useState<MorphologyState>({
    dimensions: [],
    paradigms: [],
  });
  const [phonology, setPhonology] = useState<PhonologyConfig>({
    name: "Default Phonology",
    description: "",
    consonants: [],
    vowels: [],
    syllableStructure: "",
    bannedCombinations: [],
  });
  const [rules, setRules] = useState<SoundChangeRule[]>([]);
  const [constraints, setConstraints] = useState<ProjectConstraints>(
    INITIAL_CONSTRAINTS_TEMPLATE
  );
  const [scriptConfig, setScriptConfig] = useState<ScriptConfig>(
    INITIAL_SCRIPT_CONFIG
  );
  const [notebook, setNotebook] = useState("");

  const loadProjectData = (data: ProjectData) => {
    if (data.name) setProjectName(data.name);
    setProjectAuthor(data.author || "Unknown");
    setProjectDescription(data.description || "");
    if (data.lexicon) setLexicon(data.lexicon);
    if (data.grammar) setGrammar(data.grammar);
    if (data.morphology) setMorphology(data.morphology);
    if (data.phonology) setPhonology(data.phonology);
    if (data.evolutionRules) setRules(data.evolutionRules);
    if (data.scriptConfig) setScriptConfig(data.scriptConfig || INITIAL_SCRIPT_CONFIG);
    setNotebook(data.notebook || "");
    if (data.constraints)
      setConstraints({ ...INITIAL_CONSTRAINTS_TEMPLATE, ...data.constraints });
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        loadProjectData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load project from storage", e);
      }
    }
  }, []);

  useEffect(() => {
    const projectData: ProjectData = {
      version: "1.1",
      name: projectName,
      author: projectAuthor,
      description: projectDescription,
      lexicon,
      grammar,
      morphology,
      phonology,
      evolutionRules: rules,
      constraints,
      scriptConfig,
      notebook,
      lastModified: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projectData));
    } catch (e) {
      console.error("Auto-save failed", e);
    }
  }, [
    projectName,
    projectAuthor,
    projectDescription,
    lexicon,
    grammar,
    morphology,
    phonology,
    rules,
    constraints,
    scriptConfig,
    notebook,
  ]);

  const getFullProjectData = (): ProjectData => ({
    version: "1.1",
    name: projectName,
    author: projectAuthor,
    description: projectDescription,
    lexicon,
    grammar,
    morphology,
    phonology,
    evolutionRules: rules,
    constraints,
    scriptConfig,
    notebook,
    lastModified: Date.now(),
  });

  return {
    projectName,
    setProjectName,
    projectAuthor,
    setProjectAuthor,
    projectDescription,
    setProjectDescription,
    lexicon,
    setLexicon,
    grammar,
    setGrammar,
    morphology,
    setMorphology,
    phonology,
    setPhonology,
    rules,
    setRules,
    constraints,
    setConstraints,
    scriptConfig,
    setScriptConfig,
    notebook,
    setNotebook,
    loadProjectData,
    getFullProjectData,
  };
};
