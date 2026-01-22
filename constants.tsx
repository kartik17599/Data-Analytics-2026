
import { Topic } from './types';

export const INITIAL_SYLLABUS: Topic[] = [
  {
    id: 'foundation-1',
    category: 'Phase 1: High Priority - Probability & Stats',
    subTopics: [
      { id: 'ps-1', title: 'Counting & Axioms of Probability', completed: false },
      { id: 'ps-2', title: 'Conditional Probability & Bayes Theorem', completed: false },
      { id: 'ps-3', title: 'Distributions: Bernoulli, Binomial, Poisson', completed: false },
      { id: 'ps-4', title: 'Normal & Standard Normal Distributions', completed: false },
      { id: 'ps-5', title: 'Central Limit Theorem & Confidence Intervals', completed: false },
      { id: 'ps-6', title: 'Hypothesis Testing: z-test, t-test, chi-squared', completed: false }
    ]
  },
  {
    id: 'foundation-2',
    category: 'Phase 2: High Priority - Linear Algebra',
    subTopics: [
      { id: 'la-1', title: 'Vector Spaces & Linear Independence', completed: false },
      { id: 'la-2', title: 'Matrices: Projection, Orthogonal, Idempotent', completed: false },
      { id: 'la-3', title: 'Gaussian Elimination & Rank-Nullity', completed: false },
      { id: 'la-4', title: 'Eigenvalues & Eigenvectors', completed: false },
      { id: 'la-5', title: 'LU & Singular Value Decomposition (SVD)', completed: false }
    ]
  },
  {
    id: 'core-ml',
    category: 'Phase 3: Core - Machine Learning',
    subTopics: [
      { id: 'ml-1', title: 'Regression: Linear, Multiple, Ridge, Logistic', completed: false },
      { id: 'ml-2', title: 'Classification: k-NN, Naive Bayes, SVM', completed: false },
      { id: 'ml-3', title: 'Decision Trees & Bias-Variance Trade-off', completed: false },
      { id: 'ml-4', title: 'Neural Networks & Cross-Validation', completed: false },
      { id: 'ml-5', title: 'Unsupervised: K-Means, PCA, Clustering', completed: false }
    ]
  },
  {
    id: 'essential-math',
    category: 'Phase 4: Important - Calculus & Optimization',
    subTopics: [
      { id: 'co-1', title: 'Limits, Continuity & Differentiability', completed: false },
      { id: 'co-2', title: 'Taylor Series & Single Variable Calculus', completed: false },
      { id: 'co-3', title: 'Maxima, Minima & Optimization', completed: false }
    ]
  },
  {
    id: 'tech-stack-1',
    category: 'Phase 5: Programming & DSA',
    subTopics: [
      { id: 'dsa-1', title: 'Stacks, Queues & Linked Lists', completed: false },
      { id: 'dsa-2', title: 'Trees & Hash Tables', completed: false },
      { id: 'dsa-3', title: 'Search & Sort: Binary, Merge, Quick', completed: false },
      { id: 'dsa-4', title: 'Graph Theory: Traversals & Shortest Path', completed: false }
    ]
  },
  {
    id: 'tech-stack-2',
    category: 'Phase 6: Database Systems',
    subTopics: [
      { id: 'db-1', title: 'ER-Model & Relational Algebra', completed: false },
      { id: 'db-2', title: 'SQL & Normal Forms', completed: false },
      { id: 'db-3', title: 'Indexing & Data Warehouse Modeling', completed: false }
    ]
  },
  {
    id: 'specialization',
    category: 'Phase 7: Specialized AI',
    subTopics: [
      { id: 'ai-1', title: 'Search: Informed, Uninformed, Adversarial', completed: false },
      { id: 'ai-2', title: 'Logic: Propositional & Predicate', completed: false },
      { id: 'ai-3', title: 'Reasoning under Uncertainty & Inference', completed: false }
    ]
  }
];
