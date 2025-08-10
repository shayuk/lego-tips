// *** התחל העתקה: PedagogicalLibrary.tsx (מתוקן) ***

import React, { useState, useMemo, useEffect } from 'react';
import { assessmentMethods } from '../features/assessmentBuilder/lib/assessmentMethods';
import { AssessmentMethod } from '../features/assessmentBuilder/lib/assessmentTypes';
import { getPrivateTips, savePrivateTip, deletePrivateTip, NewTipData } from '../features/pedagogicalTips/lib/pedagogicalTipStorage';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './Select';
import { Dialog, DialogContent } from './Dialog';
import { Star, Info, Search, Filter, Plus, ExternalLink, X, User, Sparkles } from 'lucide-react';
import styles from '../features/assessmentBuilder/components/PedagogicalMethodSelector.module.css';

import { getFunctions, httpsCallable } from "firebase/functions";

// הפונקציה המעודכנת שקוראת ל־Cloud Function המאובטח דרך הבינה המלאכותית
async function generateAssignment(promptText: string) {
    const functions = getFunctions();
    const callChatGpt = httpsCallable(functions, 'callChatGpt');

   
    try {
        console.log(`Calling cloud function with prompt: "${promptText}"`);
        // השינוי החשוב: פונקציות onRequest מצפות לקבל את המידע בתוך אובייקט data
        const result = await callChatGpt({ prompt: promptText });
        // התשובה גם היא נמצאת בתוך אובייקט data
        const aiResult = (result.data as any).result;
        console.log("Response from AI:", aiResult);
        return aiResult;
    } catch (error) {
        console.error("Error calling Cloud Function:", error);
        alert("An error occurred while communicating with the AI service.");
        return null;
    }
}


interface PedagogicalLibraryProps {
  className?: string;
}

const DifficultyStars = ({ level }: { level: number }) => (
  <div className={styles.stars}>
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={16} className={i < level ? styles.filledStar : styles.emptyStar} />
    ))}
  </div>
);

const MethodDetailsContent = ({ method }: { method: any }) => (
    <div className={styles.modalBody} style={{ maxHeight: '80vh', overflowY: 'auto', padding: 'var(--spacing-4)' }}>
        <div className={styles.modalHeader} style={{ position: 'sticky', top: 0, background: 'var(--card)', zIndex: 1, paddingTop: 0, paddingBottom: 'var(--spacing-2)' }}>
            <h2 id="method-modal-title" className={styles.modalTitle}>{method?.title}</h2>
        </div>
        <div className={styles.modalSection}><h3 className={styles.sectionTitle}>📋 תיאור</h3><p className={styles.description}>{method.description}</p>{method.fullDescription && (<div className={styles.fullDescription}><h4 className={styles.subsectionTitle}>תיאור מלא</h4><div className={styles.descriptionContent}>{method.fullDescription.split('\n\n').map((p:string, i:number) => (<p key={i} style={{marginBottom:'10px',lineHeight:'1.6'}}>{p}</p>))}</div></div>)}</div>
        <div className={styles.modalSection}><h3 className={styles.sectionTitle}>מאפיינים טכניים</h3><div className={styles.technicalInfo}><div className={styles.techItem}><span className={styles.techLabel}>רמת קושי:</span><DifficultyStars level={method.implementation_difficulty} /></div><div className={styles.techItem}><span className={styles.techLabel}>השקעת זמן:</span><Badge variant="secondary">{method.time_investment}</Badge></div><div className={styles.techItem}><span className={styles.techLabel}>גדלי כיתה:</span><div className={styles.badgeGroup}>{method.class_size_suitability.map((s:string, i:number) => <Badge key={i} variant="outline">{s}</Badge>)}</div></div></div></div>
        <div className={styles.modalSection}><h3 className={styles.sectionTitle}>יתרונות</h3><ul className={styles.modalList}>{method.advantages.pedagogical.map((adv:string, i:number) => <li key={`ped-${i}`}><strong>פדגוגי:</strong> {adv}</li>)}{method.advantages.practical.map((adv:string, i:number) => <li key={`pra-${i}`}><strong>מעשי:</strong> {adv}</li>)}{method.advantages.student_engagement.map((adv:string, i:number) => <li key={`eng-${i}`}><strong>מעורבות:</strong> {adv}</li>)}</ul></div>
        <div className={styles.modalSection}><h3 className={styles.sectionTitle}>חסרונות ואתגרים</h3><ul className={styles.modalList}>{method.disadvantages.challenges.map((dis:string, i:number) => <li key={`cha-${i}`}><strong>אתגר:</strong> {dis}</li>)}{method.disadvantages.limitations.map((dis:string, i:number) => <li key={`lim-${i}`}><strong>מגבלה:</strong> {dis}</li>)}{method.disadvantages.resource_requirements.map((dis:string, i:number) => <li key={`res-${i}`}><strong>דרישות:</strong> {dis}</li>)}</ul></div>
        {method.toolsWithLinks?.[0]?.name && (<div className={styles.modalSection}><h3 className={styles.sectionTitle}>כלים עם קישורים</h3><div className={styles.toolsGrid}>{method.toolsWithLinks.map((tool:any, i:number) => (<a href={tool.link} target="_blank" rel="noopener noreferrer" key={i} className={styles.toolLinkCard}><div className={styles.toolLinkHeader}><span className={styles.toolName}>{tool.name}</span><ExternalLink size={14}/></div><p className={styles.toolDescription}>{tool.description}</p></a>))}</div></div>)}
        {method.furtherReading?.[0]?.title && (<div className={styles.modalSection}><h3 className={styles.sectionTitle}>מקורות להעמקה</h3><ul className={styles.readingList}>{method.furtherReading.map((item:{title:string, link:string}, i:number) => (<li key={i}><a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}<ExternalLink size={14} className={styles.readingLinkIcon}/></a></li>))}</ul></div>)}
    </div>
);

export const PedagogicalLibrary: React.FC<PedagogicalLibraryProps> = ({ className }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [isAddTipModalOpen, setIsAddTipModalOpen] = useState(false);
  const [selectedMethodForDetails, setSelectedMethodForDetails] = useState<AssessmentMethod | null>(null);
  const [newTip, setNewTip] = useState({ title: '', shortDescription: '', fullDescription: '', categories: [] as string[], classSizes: [] as string[], teachingMethods: [] as string[], subjectAreas: [] as string[], difficulty: '', timeInvestment: '', advantages: { pedagogical: '', practical: '', engagement: '' }, disadvantages: { challenges: '', limitations: '', resources: '' }, recommendedTools: '', toolsWithLinks: [{ name: '', link: '', description: '' }], furtherReading: [{ title: '', link: '' }], implementationGuidelines: '', rubricTemplate: '' });
  const [allMethods, setAllMethods] = useState<AssessmentMethod[]>([]);

  useEffect(() => { const publicTips = assessmentMethods; const privateTips = getPrivateTips().map(tip => ({ ...tip, isPrivate: true })); setAllMethods([...publicTips, ...privateTips]); }, []);
  const filteredAndSortedMethods = useMemo(() => { return allMethods.filter(method => { const matchesSearch = searchQuery === '' || method.title.toLowerCase().includes(searchQuery.toLowerCase()) || method.description.toLowerCase().includes(searchQuery.toLowerCase()); const matchesCategory = categoryFilter === 'all' || method.categories.includes(categoryFilter as any); const matchesDifficulty = difficultyFilter === 'all' || method.implementation_difficulty.toString() === difficultyFilter; return matchesSearch && matchesCategory && matchesDifficulty; }).sort((a, b) => { if (a.isPrivate && !b.isPrivate) return -1; if (!a.isPrivate && b.isPrivate) return 1; return a.title.localeCompare(b.title); }); }, [searchQuery, categoryFilter, difficultyFilter, allMethods]);
  const handleSaveNewTip = (isPublic: boolean) => { if (isPublic) { console.log('Submitting tip for public review:', newTip); alert('הטיפ הוגש לבדיקה ויופיע במאגר הציבורי לאחר אישור.'); } else { savePrivateTip(newTip as NewTipData); const privateTips = getPrivateTips().map(tip => ({ ...tip, isPrivate: true })); setAllMethods([...assessmentMethods, ...privateTips]); alert('הטיפ נשמר בהצלחה במאגר הפרטי שלך!'); } setIsAddTipModalOpen(false); setNewTip({ title: '', shortDescription: '', fullDescription: '', categories: [], classSizes: [], teachingMethods: [], subjectAreas: [], difficulty: '', timeInvestment: '', advantages: { pedagogical: '', practical: '', engagement: '' }, disadvantages: { challenges: '', limitations: '', resources: '' }, recommendedTools: '', toolsWithLinks: [{ name: '', link: '', description: '' }], furtherReading: [{ title: '', link: '' }], implementationGuidelines: '', rubricTemplate: '' }); };
  const handleAddToolLink = () => setNewTip(prev => ({...prev, toolsWithLinks: [...prev.toolsWithLinks, { name: '', link: '', description: '' }]}));
  const handleAddFurtherReading = () => setNewTip(prev => ({...prev, furtherReading: [...prev.furtherReading, { title: '', link: '' }]}));
  const handleDeletePrivateTip = (tipId: string) => { if (window.confirm("האם אתה בטוח שברצונך למחוק את הטיפ הפרטי הזה?")) { deletePrivateTip(tipId); const privateTips = getPrivateTips().map(tip => ({ ...tip, isPrivate: true })); setAllMethods([...assessmentMethods, ...privateTips]); setSelectedMethodForDetails(null); } };
  const handleGenerateClick = async () => { if (!aiPrompt.trim()) { alert("אנא הזן נושא ליצירת מטלה."); return; } setIsLoadingAi(true); setAiResult(''); const fullPrompt = `Create a short academic assignment about: "${aiPrompt}".`; const result = await generateAssignment(fullPrompt); if (result) { setAiResult(result); } setIsLoadingAi(false); };
  const uniqueCategories = useMemo(() => { const cats = new Set(allMethods.flatMap(m => m.categories)); return ['all', ...Array.from(cats)]; }, [allMethods]);
  const uniqueDifficulties = useMemo(() => { const diffs = new Set(allMethods.map(m => m.implementation_difficulty.toString())); return ['all', ...Array.from(diffs)]; }, [allMethods]);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}><h2 style={{ color: 'var(--foreground)', margin: 0 }}>ספריית שיטות הערכה</h2><Button onClick={() => setIsAddTipModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', backgroundColor: 'var(--primary)', color: 'white' }}><Plus size={18} /> הוסף טיפ פדגוגי חדש</Button></div>
      
      <div style={{ padding: 'var(--spacing-6)', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)', marginBottom: 'var(--spacing-6)', border: '1px solid var(--border)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)'}}><Sparkles size={24} color="var(--primary)" /><h3 style={{ margin: 0, color: 'var(--foreground)' }}> AI מחולל מטלות מבוסס</h3></div>
        <p style={{color: 'var(--muted-foreground)', marginBottom: 'var(--spacing-4)'}}>:הזן נושא או מושג, והבינה המלאכותית תנסח עבורך הצעה למטלה קצרה</p>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}><Input placeholder="...לדוגמה: פוטוסינתזה, מלחמת העולם השנייה, שירת ביאליק" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} style={{ flexGrow: 1 }}/><Button onClick={handleGenerateClick} disabled={isLoadingAi}>{isLoadingAi ? 'חושב...' : 'צור מטלה'}</Button></div>
        {isLoadingAi && (<div style={{ textAlign: 'center', padding: 'var(--spacing-4)'}}>טוען... אנא המתן.</div>)}
        {aiResult && !isLoadingAi && (<div style={{ marginTop: 'var(--spacing-6)', padding: 'var(--spacing-4)', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}><h4 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-3)'}}>הצעה למטלה:</h4>{aiResult}</div>)}
      </div>

      <div className={styles.filterBar}><div className={styles.searchContainer}><Search size={18} className={styles.searchIcon} /><Input placeholder="חפש שיטות הערכה..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={styles.searchInput} /></div><Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger><SelectValue placeholder="סוג קורס" /></SelectTrigger><SelectContent>{uniqueCategories.map((c) => (<SelectItem key={c} value={c}>{c === 'all' ? 'כל הסוגים' : c}</SelectItem>))}</SelectContent></Select><Select value={difficultyFilter} onValueChange={setDifficultyFilter}><SelectTrigger><SelectValue placeholder="רמת קושי" /></SelectTrigger><SelectContent>{uniqueDifficulties.map((d) => (<SelectItem key={d} value={d}>{d === 'all' ? 'כל הרמות' : `רמה ${d}`}</SelectItem>))}</SelectContent></Select></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--spacing-4)' }}>
        {filteredAndSortedMethods.map((method, index) => (
          <div key={method.id || index} className={`${styles.methodCard} ${method.isPrivate ? styles.privateTipCard : ''}`}>
            {method.isPrivate && <div className={styles.privateBadge}><User size={14} /> טיפ פרטי</div>}
            <div className={styles.cardContent}><h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--spacing-2)', color: 'var(--foreground)' }}>{method.title}</h4><div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-3)' }}>{method.categories.map((c) => (<Badge key={c} variant="secondary">{c}</Badge>))}</div></div>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.6', marginBottom: 'var(--spacing-4)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{method.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}><span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>רמת קושי:</span><DifficultyStars level={method.implementation_difficulty} /></div>
              <Button variant="outline" size="sm" onClick={() => setSelectedMethodForDetails(method)}><Info size={16} /> מידע נוסף</Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedMethodForDetails} onOpenChange={(isOpen) => !isOpen && setSelectedMethodForDetails(null)}>
        <DialogContent className={styles.dialogContentLarge}>
          {selectedMethodForDetails && (<>
              <MethodDetailsContent method={selectedMethodForDetails} />
              {selectedMethodForDetails.isPrivate && (<div className={styles.modalFooter} style={{ padding: 'var(--spacing-4)', borderTop: '1px solid var(--border)', textAlign: 'left' }}><Button variant="destructive" onClick={() => handleDeletePrivateTip(selectedMethodForDetails.id)}>מחק טיפ פרטי</Button></div>)}
          </>)}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAddTipModalOpen} onOpenChange={setIsAddTipModalOpen}>
        <DialogContent className={styles.addTipModalContent}>
          <div style={{ maxHeight: '80vh', overflowY: 'auto', padding: 'var(--spacing-2)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: 'var(--spacing-4)', color: 'var(--foreground)', textAlign: 'center' }}>✨ הוסף טיפ פדגוגי חדש</h2>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: 'var(--spacing-3)', borderRadius: 'var(--radius)', marginBottom: 'var(--spacing-6)', fontSize: '0.9rem', textAlign: 'center' }}>📋 <strong>הטופס כולל 7 קטגוריות מקצועיות</strong> - מלא רק את השדות הרלוונטיים עבורך</div>
            <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
              <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--foreground)', fontWeight: 'bold' }}>📝 מידע בסיסי</h4>
                <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
                  <div><label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>כותרת הטיפ *</label><Input placeholder="לדוגמה: מבחנים עם הגבלת זמן דרסטית" value={newTip.title} onChange={(e) => setNewTip(prev => ({ ...prev, title: e.target.value }))}/></div>
                  <div><label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>תיאור קצר *</label><Textarea placeholder="תיאור קצר ותמציתי של הטיפ (1-2 שורות)" rows={2} value={newTip.shortDescription} onChange={(e) => setNewTip(prev => ({ ...prev, shortDescription: e.target.value }))}/></div>
                  <div><label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>תיאור מפורט (אופציונלי)</label><Textarea placeholder="הסבר מפורט יותר על הטיפ, איך הוא עובד ומתי להשתמש בו" rows={4} value={newTip.fullDescription} onChange={(e) => setNewTip(prev => ({ ...prev, fullDescription: e.target.value }))}/></div>
                </div>
              </div>
              <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}><h4 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--foreground)', fontWeight: 'bold' }}>🎯 התאמות פדגוגיות</h4><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}><div><label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>קטגוריות קורס</label><div style={{ display: 'grid', gap: 'var(--spacing-2)' }}>{['קורס מבוא', 'קורס רב משתתפים', 'קורס מתקדם'].map(c => (<label key={c} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}><input type="checkbox" checked={newTip.categories.includes(c)} onChange={(e) => {if(e.target.checked){setNewTip(p=>({...p,categories:[...p.categories,c]}))}else{setNewTip(p=>({...p,categories:p.categories.filter(cat=>cat!==c)}))}} }/><span>{c}</span></label>))}</div></div><div><label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>גדלי כיתה מתאימים</label><div style={{ display: 'grid', gap: 'var(--spacing-2)' }}>{['כיתה קטנה (עד 30)', 'כיתה בינונית (30-70)', 'כיתה גדולה (70-150)', 'כיתה רבת משתתפים (150+)'].map(s => (<label key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}><input type="checkbox" checked={newTip.classSizes.includes(s)} onChange={(e) => {if(e.target.checked){setNewTip(p=>({...p,classSizes:[...p.classSizes,s]}))}else{setNewTip(p=>({...p,classSizes:p.classSizes.filter(size=>size!==s)}))}} }/><span>{s}</span></label>))}</div></div></div></div>
              <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}><h4 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--foreground)', fontWeight: 'bold' }}>🔗 כלים וקישורים פעילים</h4><div style={{ display: 'grid', gap: 'var(--spacing-4)' }}><div><label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>כלים עם קישורים פעילים</label>{newTip.toolsWithLinks.map((tool, index) => (<div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}><Input placeholder="שם הכלי" value={tool.name} onChange={(e)=>{const u=[...newTip.toolsWithLinks];u[index].name=e.target.value;setNewTip(p=>({...p,toolsWithLinks:u}))}}/><Input placeholder="קישור" value={tool.link} onChange={(e)=>{const u=[...newTip.toolsWithLinks];u[index].link=e.target.value;setNewTip(p=>({...p,toolsWithLinks:u}))}}/><Input placeholder="תיאור הכלי" value={tool.description} onChange={(e)=>{const u=[...newTip.toolsWithLinks];u[index].description=e.target.value;setNewTip(p=>({...p,toolsWithLinks:u}))}}/></div>))}<Button variant="outline" size="sm" onClick={handleAddToolLink} style={{ justifySelf: 'start' }}>➕ הוסף כלי נוסף</Button></div><div><label style={{ display: 'block', marginBottom: 'var(--spacing-2)', fontWeight: '600' }}>מקורות להעמקה</label>{newTip.furtherReading.map((r, i) => (<div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}><Input placeholder="כותרת המאמר/המקור" value={r.title} onChange={(e)=>{const u=[...newTip.furtherReading];u[i].title=e.target.value;setNewTip(p=>({...p,furtherReading:u}))}}/><Input placeholder="קישור" value={r.link} onChange={(e)=>{const u=[...newTip.furtherReading];u[i].link=e.target.value;setNewTip(p=>({...p,furtherReading:u}))}}/></div>))}<Button variant="outline" size="sm" onClick={handleAddFurtherReading} style={{ justifySelf: 'start' }}>➕ הוסף מקור נוסף</Button></div></div></div>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-6)', backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', border: '2px solid var(--primary)' }}><h4 style={{ marginBottom: 'var(--spacing-4)' }}>🎯 איך תרצה לשמור את הטיפ?</h4><div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center', flexWrap: 'wrap' }}><Button size="lg" variant="outline" onClick={()=>handleSaveNewTip(false)} disabled={!newTip.title.trim()||!newTip.shortDescription.trim()}>💾 שמור למאגר הפרטי שלי</Button><Button size="lg" onClick={()=>handleSaveNewTip(true)} disabled={!newTip.title.trim()||!newTip.shortDescription.trim()}>🌟 הוסף למאגר הציבורי</Button></div><p style={{ marginTop: 'var(--spacing-3)', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>* שדות חובה: כותרת ותיאור קצר בלבד.</p></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// *** סיים העתקה כאן ***