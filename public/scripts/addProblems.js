import { db} from './firebaseConfig.js';
import { collection, doc, addDoc } from './firebaseConfig.js';

const humanProblems = [
  {
    problemStatement: "The violinist performed the final movement, [wearing a sequined jacket once owned by a Hungarian virtuoso] (B), to a jury of professors [who had] (C) studied under Bartók [and] (D) [whose] (E) applause was hesitant.",
    answer: "B",
    solution: "Option (B) contains a misplaced modifier (MM) error because the participial phrase \"wearing a sequined jacket once owned by a Hungarian virtuoso\" is placed after \"movement,\" making it appear to modify \"movement\" instead of the intended subject \"violinist.\"",
    category: "MM",
    source: "Human",
    elo: 100
  },
  {
    problemStatement: "I know [that] (B) you [knew] (C) that I'm [as wise as] (D) [him] (E).",
    answer: "E",
    solution: "Option E contains a case (CASE) error because \"him\" should be \"he”—in the elliptical comparison \"as wise as him (is),\" the pronoun functions as the subject of the understood verb \"is\" and therefore requires the subject case \"he.\"",
    category: "CASE",
    source: "Human",
    elo: 250
  },
  {
    problemStatement: "Neither the mountain of unread submissions nor [the myriad] (B) footnotes buried in the appendix [has been reviewed] (C) by the editorial team [despite] (D) multiple reminders circulated through internal memos and follow-up emails, [each increasingly] (E) terse and exasperated.",
    answer: "C",
    solution: "Option (C), 'has been reviewed', is an AGREEMENT error. When subjects are connected by 'nor', the verb agrees with the nearer subject. In this case, the nearer subject to the verb 'has been reviewed' is 'footnotes', which is incorrectly plural.",
    category: "AGREE",
    source: "Human",
    elo: 275
  },
  {
    problemStatement: "[There] (B) is a common belief [that] (C) pirates killed [whoever] (D) they saw, but [this] (E) belief is false.",
    answer: "D",
    solution: "The pronoun 'whoever' functions as the direct object of the verb 'saw' within the clause 'whoever they saw' (they saw whom?). Pronouns used as objects must be in the object case. The object case for 'whoever' is 'whomever'.",
    category: "CASE",
    source: "Human",
    elo: 150
  },
  {
    problemStatement: "Timmy had a poor score on the Megablunders exam [because] (B) he made a couple of silly mistakes, [but, to be fair,] (C) I would probably have gotten the same score as [his] (D) if I [had been] (E) in the same noisy environment.",
    answer: "D",
    solution: "Option (D) contains a CASE error from the improper use of an elliptical construction. The pronoun must match its predecessor's type (subject or object): “…the same score as he [had],” not “…the same score as his.",
    category: "CASE",
    source: "Human",
    elo: 150
  },
  {
    problemStatement: "If I [was] (B) in Ms. Tan's class and [in] (C) your situation, I would ask the academic dean, [who is very harsh] (D), and [Ms. Tan] (E) for an extension on the history paper.",
    answer: "B",
    solution: "Option (B), 'was', is an AGREE error. The sentence begins with 'If' and describes a hypothetical or contrary-to-fact situation ('If I was... I would ask...'), which requires the subjunctive mood for the verb in the 'if' clause. For the verb 'to be' in the past subjunctive, the correct form for all persons, including 'I', is 'were'. Therefore, the sentence should read 'If I were in Ms. Tan's class...'.",
    category: "AGREE",
    source: "Human",
    elo: 500
  },
  {
    problemStatement: "Once the memoir was released, [with] (B) [its] (C) fragmented prose and deliberately inconsistent chronology, [it became clear] (D) that the audience would not respond uniformly, a response [which] (E) frustrated reviewers who struggled to determine the memoir’s purpose.",
    answer: "A",
    solution: "The sentence contains no grammatical errors. The preposition '[with]' (B) correctly introduces a modifying phrase without creating an incomplete sentence or an improperly joined one. The possessive pronoun '[its]' (C) clearly refers to the singular noun 'memoir,' demonstrating correct pronoun reference and agreement in number with its antecedent. The phrase '[it became clear]' (D) properly uses 'it' as a placeholder subject for the subsequent noun clause, and the singular verb 'became' agrees with this placeholder. Finally, the relative pronoun '[which]' (E) appropriately introduces an adjective clause modifying the specific noun 'response' that immediately precedes it, thus avoiding the issue of a pronoun referring vaguely to an entire preceding idea. This adjective clause is correctly placed, and 'which' functions as the subject within its own clause, satisfying case requirements.",
    category: "A",
    source: "Human",
    elo: 400
  },
  {
    problemStatement: "[The pot boiling from the flames] (B), the special potion was made by the evil witch [despite] (C) the [pot’s] (D) [near] (E) bursting.",
    answer: "A",
    solution: "The sentence contains no grammatical errors. Option (B), '[The pot boiling from the flames,]', is a correctly formed absolute phrase. Such phrases, consisting of a noun ('The pot') followed by a participle ('boiling'), modify the entire main clause ('the special potion was made by the evil witch'). The preposition '[despite]' (C) correctly introduces a phrase indicating contrast. The possessive noun '[pot’s]' (D) is appropriately used before the gerund 'bursting', as the rules for case dictate that a noun or pronoun before a gerund should be in the possessive form. Finally, '[near]' (E) functions correctly as an adjective modifying 'bursting'.",
    category: "A",
    source: "Human",
    elo: 450
  },
  {
    problemStatement: "A carbon tax would generate significant funds [amounting] (B) to [nearly] (C) 125 million dollars; with these funds, the government should invest in public issues: 10% of [them] (D) should go to low-income households and the rest should go to the most pressing issues at the time of the carbon tax, [which] (E) are currently the government deficit and a potential default.",
    answer: "D",
    solution: "Option (D) contains a pronoun reference (PR) error because \"them\" is ambiguous—it could refer to either \"funds\" (more logical) or \"public issues\" (more grammatically correct, but illogical), making it impossible for readers to determine the intended antecedent with certainty.",
    category: "PR",
    source: "Human",
    elo: 400
  },
  {
    problemStatement: "[Showcasing] (B) a rare Ming Dynasty manuscript—known for [its] (C) thin brushstrokes and mulberry-bark paper fibers—the curator presented the masterpiece to a group of tourists [who] (D) [had been kept] (E) in airtight chambers for preservation.",
    answer: "E",
    solution: "Option D contains a misplaced modifier (MM) error because the adjective clause \"who had been kept in airtight chambers for preservation\" incorrectly modifies \"tourists\" instead of the intended antecedent \"manuscript,\" creating the absurd meaning that the tourists were stored in airtight chambers.",
    category: "MM",
    source: "Human",
    elo: 350
  },
  {
    problemStatement: "The array of volatile variables, [along with] (B) the coefficients derived from inconsistent models, [suggest] (C) the conclusion remains unsubstantiated [because] (D) neither the assumptions nor the results correspond consistently with empirical observations, [which] (E) trouble the most experienced statisticians.",
    answer: "C",
    solution: "Option C contains a subject-verb agreement (AGREE) error because the singular subject \"array\" requires the singular verb \"suggests,\" not the plural \"suggest\"—the intervening prepositional phrase \"along with the coefficients derived from inconsistent models\" does not change the fact that \"array\" is singular.",
    category: "AGREE",
    source: "Human",
    elo: 300
  },
  {
    problemStatement: "While the extent of this improvement [that] (B) can be attributed to Trotsky is difficult to discern, especially when one considers that some improvement could be attributed to economic recovery from the Great War and the Russian Civil War as well as various other NEP [policies because] (C) Trotsky created the [unanimously approved] (D) four-stage plan, which guided economic policies during the NEP-era, and he advocated [heavily] (E) for the electrification of Russia prior to his lackluster time as a director of the ETO, a significant portion of the improvement in power generation can be credited to Trotsky.",
    answer: "A",
    solution: "There are no errors in this sentence. Option (B), 'that', correctly introduces a restrictive adjective clause modifying 'improvement'. Option (C), 'policies because', appropriately uses 'because' to introduce a subordinate clause of reason, logically connecting to the preceding ideas about NEP policies. Option (D), 'unanimously approved', features the adverb 'unanimously' correctly modifying the participial adjective 'approved', which describes 'four-stage plan'. Option (E), 'heavily', is an adverb correctly modifying the verb 'advocated'. The sentence, though complex, maintains grammatical integrity without issues in sentence completeness, pronoun reference, agreement, case, or modifier placement.",
    category: "A",
    source: "Human",
    elo: 450
  }
]

humanProblems.forEach(async (problem) => {
    await addDoc(collection(db, 'problems'), {
      problemStatement: problem.problemStatement,
      answer: problem.answer,
      solution: problem.solution,
      category: problem.category,
      source: problem.source,
      elo: problem.elo
    });
});


console.log('sucess');