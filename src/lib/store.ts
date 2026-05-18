import { RegisterItem, Project, RegisterType, CLOSED_STATUSES } from '@/types'

// ── Keys ──
const ITEMS_KEY    = 'chase:items'
const PROJECTS_KEY = 'chase:projects'

// ── Projects ──
export function getProjects(): Project[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || 'null') ?? defaultProjects()
  } catch { return defaultProjects() }
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export function addProject(project: Project) {
  saveProjects([...getProjects(), project])
}

function defaultProjects(): Project[] {
  return [
    { id: 'p1', name: '300 Collins Street', code: 'COL-300', color: '#2a4fa8', createdAt: new Date().toISOString() },
    { id: 'p2', name: 'Fitzroy Mixed-Use',  code: 'FIT-MU',  color: '#2e6645', createdAt: new Date().toISOString() },
  ]
}

// ── Register Items ──
export function getItems(): RegisterItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(ITEMS_KEY) || 'null') ?? defaultItems()
  } catch { return defaultItems() }
}

export function saveItems(items: RegisterItem[]) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

export function addItem(item: RegisterItem) {
  saveItems([item, ...getItems()])
}

export function updateItem(id: string, updates: Partial<RegisterItem>) {
  saveItems(getItems().map(i => i.id === id ? { ...i, ...updates } : i))
}

// ── Helpers ──
export function nextNumber(items: RegisterItem[], type: RegisterType): string {
  const nums = items
    .filter(i => i.type === type)
    .map(i => { const m = i.number.match(/(\d+)$/); return m ? parseInt(m[1]) : 0 })
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `${type}-${String(next).padStart(2, '0')}`
}

export function isOverdue(item: RegisterItem): boolean {
  if (!item.dueDate || CLOSED_STATUSES.includes(item.status)) return false
  return new Date(item.dueDate + 'T23:59:59') < new Date()
}

export function isDueThisWeek(item: RegisterItem): boolean {
  if (!item.dueDate || CLOSED_STATUSES.includes(item.status)) return false
  const due = new Date(item.dueDate + 'T12:00:00')
  const now = new Date()
  const week = new Date()
  week.setDate(now.getDate() + 7)
  return due >= now && due <= week
}

export function isClosed(item: RegisterItem): boolean {
  return CLOSED_STATUSES.includes(item.status)
}

export function isAwaiting(item: RegisterItem): boolean {
  return ['Waiting Response', 'Pending', 'Submitted'].includes(item.status) && !isOverdue(item)
}

export function fmtDate(d: string): string {
  if (!d) return '—'
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-AU', {
      day: '2-digit', month: '2-digit', year: '2-digit',
    })
  } catch { return d }
}

// ── Default seed data ──
function defaultItems(): RegisterItem[] {
  return [
    { id:'i01',type:'RFI',number:'RFI-01',projectId:'p1',title:'Confirm slab penetration prior to PT pour',responsible:'Gray Puksand',discipline:'Structure',issued:'2026-01-15',dueDate:'2026-01-29',status:'Closed',notes:'Confirmed acceptable.',emailText:'Hi Paraic,\n\nWe need written confirmation that the 150mm circular penetration at gridline B/7 on Level 3 is acceptable prior to commencing the PT pour scheduled for Monday.\n\nCan you please advise by COB Friday?\n\nRegards,\nDave Singh\nBuildCorp Site Manager',followUp:'',createdAt:'2026-01-15T00:00:00Z'},
    { id:'i02',type:'RFI',number:'RFI-02',projectId:'p1',title:'Facade panel fixings at Level 7 parapet',responsible:'BVN Engineering',discipline:'Structure',issued:'2026-02-03',dueDate:'2026-02-17',status:'Closed',notes:'Confirmed — 4 x M12 fixings per panel.',emailText:'',followUp:'',createdAt:'2026-02-03T00:00:00Z'},
    { id:'i03',type:'RFI',number:'RFI-03',projectId:'p1',title:'Awaiting hydraulic coordination response — Level 5 wet areas',responsible:'Services Eng.',discipline:'Services',issued:'2026-02-18',dueDate:'2026-03-04',status:'Waiting Response',notes:'Chased twice. No response received.',emailText:'Hi Sarah,\n\nFollowing our coordination meeting on 14 February, we are still awaiting the hydraulic consultant\'s response on the revised wet area layout for Level 5.\n\nThe services rough-in is scheduled to commence in 3 weeks and this is now on the critical path.\n\nCould you please follow up and confirm a response date? We need this resolved by 4 March.\n\nRegards,\nParaic Walsh\nGray Puksand',followUp:'',createdAt:'2026-02-18T00:00:00Z'},
    { id:'i04',type:'RFI',number:'RFI-04',projectId:'p1',title:'Structural setdown clarification required — entry lobby',responsible:'Gray Puksand',discipline:'Architecture',issued:'2026-03-10',dueDate:'2026-03-24',status:'Open',notes:'',emailText:'Paraic,\n\nWe need clarification on the slab setdown depth at the main entry lobby. The current drawings show 50mm but the hydraulic drawings show 75mm for the drainage channel.\n\nWhich is correct? We need this resolved before we can form up.\n\nDave\nBuildCorp',followUp:'',createdAt:'2026-03-10T00:00:00Z'},
    { id:'i05',type:'APR',number:'APR-01',projectId:'p1',title:'Concrete mix design — podium slab B2',responsible:'BuildCorp',discipline:'Structure',issued:'2026-01-20',dueDate:'2026-02-03',status:'Approved',notes:'Approved. 40MPa with 20mm aggregate.',emailText:'',followUp:'',createdAt:'2026-01-20T00:00:00Z'},
    { id:'i06',type:'APR',number:'APR-02',projectId:'p1',title:'Waterproofing membrane system — basement and podium',responsible:'BuildCorp',discipline:'Architecture',issued:'2026-02-28',dueDate:'2026-03-14',status:'Pending',notes:'Awaiting test certificates.',emailText:'Hi Paraic,\n\nWe have submitted the waterproofing membrane system for your approval.\n\nWe need approval within 10 working days to maintain programme. The waterproofing contractor is booked from 28 March.\n\nRegards,\nMarcus Lee\nBuildCorp',followUp:'',createdAt:'2026-02-28T00:00:00Z'},
    { id:'i07',type:'APR',number:'APR-03',projectId:'p1',title:'Facade shop drawing approval pending — Level 3 to 8',responsible:'Client',discipline:'Architecture',issued:'2026-03-25',dueDate:'2026-04-08',status:'Pending',notes:'Samples delivered to client office.',emailText:'Hi,\n\nThe facade contractor has submitted shop drawings for Levels 3–8 for your approval. Fabrication lead time is 10 weeks — we need approval by 8 April to maintain programme.\n\nRegards,\nParaic Walsh\nGray Puksand',followUp:'',createdAt:'2026-03-25T00:00:00Z'},
    { id:'i08',type:'SUB',number:'SUB-01',projectId:'p1',title:'Steel shop drawings — primary columns Level 1 to 5',responsible:'Steel Co.',discipline:'Structure',issued:'2026-02-10',dueDate:'2026-02-24',status:'Approved',notes:'Approved 24.02.26 with minor comments.',emailText:'',followUp:'',createdAt:'2026-02-10T00:00:00Z'},
    { id:'i09',type:'SUB',number:'SUB-02',projectId:'p1',title:'Lift shaft and car shop drawings IFA',responsible:'Otis',discipline:'Services',issued:'2026-03-18',dueDate:'2026-04-01',status:'Reviewed',notes:'Minor comments issued 01.04.26.',emailText:'',followUp:'',createdAt:'2026-03-18T00:00:00Z'},
    { id:'i10',type:'SUB',number:'SUB-03',projectId:'p1',title:'Curtain wall and glazing system shop drawings',responsible:'Facade Co.',discipline:'Facade',issued:'2026-04-02',dueDate:'2026-04-16',status:'Pending',notes:'',emailText:'Hi Paraic,\n\nPlease find attached the curtain wall and glazing shop drawings for Levels 1–12, issued for approval.\n\nWe require your response within 10 working days.\n\nRegards,\nTim Wu\nFacade Solutions',followUp:'',createdAt:'2026-04-02T00:00:00Z'},
    { id:'i11',type:'VAR',number:'VAR-01',projectId:'p1',title:'Additional concrete pumping — Level 3 slab pour',responsible:'BuildCorp',discipline:'Contractor',issued:'2026-03-05',dueDate:'',status:'Approved',notes:'Approved $4,200 + GST.',emailText:'',followUp:'',createdAt:'2026-03-05T00:00:00Z'},
    { id:'i12',type:'VAR',number:'VAR-02',projectId:'p1',title:'Revised door schedule — 14 additional doors',responsible:'BuildCorp',discipline:'Architecture',issued:'2026-04-10',dueDate:'',status:'Pending',notes:'Under assessment.',emailText:'',followUp:'',createdAt:'2026-04-10T00:00:00Z'},
    { id:'i13',type:'EOT',number:'EOT-01',projectId:'p1',title:'Inclement weather — 3 days lost — February 2026',responsible:'BuildCorp',discipline:'Contractor',issued:'2026-02-14',dueDate:'2026-02-14',status:'Accepted',notes:'3 days accepted.',emailText:'',followUp:'',createdAt:'2026-02-14T00:00:00Z'},
    { id:'i14',type:'EOT',number:'EOT-02',projectId:'p1',title:'Steel delivery delay — supplier industrial action',responsible:'BuildCorp',discipline:'Contractor',issued:'2026-03-20',dueDate:'2026-04-03',status:'Pending',notes:'Supporting documentation requested.',emailText:'Hi Paraic,\n\nDue to the industrial action at our steel supplier, the primary steel delivery has been delayed by 8 working days.\n\nWe are formally notifying you of an EOT claim and will provide full documentation within 5 days.\n\nRegards,\nDave Singh',followUp:'',createdAt:'2026-03-20T00:00:00Z'},
    { id:'i15',type:'DEF',number:'DEF-01',projectId:'p1',title:'Cracked render panel — Level 2 west facade',responsible:'BuildCorp',discipline:'Contractor',issued:'2026-04-08',dueDate:'2026-04-22',status:'Open',notes:'',emailText:'',followUp:'',createdAt:'2026-04-08T00:00:00Z'},
    { id:'i16',type:'DEF',number:'DEF-02',projectId:'p1',title:'Incorrect door hardware — Rooms 204 to 208',responsible:'BuildCorp',discipline:'Architecture',issued:'2026-04-12',dueDate:'2026-04-26',status:'In Progress',notes:'Correct hardware on order. ETA 2 weeks.',emailText:'',followUp:'',createdAt:'2026-04-12T00:00:00Z'},
    { id:'i17',type:'SI', number:'SI-01', projectId:'p1',title:'Change floor finish to polished concrete — Level 1',responsible:'BuildCorp',discipline:'Architecture',issued:'2026-03-28',dueDate:'2026-04-11',status:'Actioned',notes:'Confirmed actioned on site 09.04.26.',emailText:'',followUp:'',createdAt:'2026-03-28T00:00:00Z'},
    { id:'i18',type:'SI', number:'SI-02', projectId:'p1',title:'Install additional base plates at gridline C',responsible:'BuildCorp',discipline:'Structure',issued:'2026-04-15',dueDate:'2026-04-29',status:'Issued',notes:'',emailText:'',followUp:'',createdAt:'2026-04-15T00:00:00Z'},
    { id:'i19',type:'ACT',number:'ACT-01',projectId:'p1',title:'Fire consultant review outstanding — sprinkler coordination',responsible:'FireSafe Eng.',discipline:'Fire',issued:'2026-04-01',dueDate:'2026-04-15',status:'Open',notes:'',emailText:'Hi Paraic,\n\nThe fire consultant\'s review of the revised sprinkler layout for Levels 6–9 is still outstanding.\n\nThe mechanical contractor cannot proceed with ceiling coordination until this is resolved. Can you please follow up and confirm a response date?\n\nThis is now on the critical path.\n\nDave Singh\nBuildCorp',followUp:'',createdAt:'2026-04-01T00:00:00Z'},
    { id:'i20',type:'ACT',number:'ACT-02',projectId:'p1',title:'Issue revised door schedule to contractor',responsible:'Gray Puksand',discipline:'Architecture',issued:'2026-04-14',dueDate:'2026-04-21',status:'Done',notes:'Issued 20.04.26.',emailText:'',followUp:'',createdAt:'2026-04-14T00:00:00Z'},
  ]
}
