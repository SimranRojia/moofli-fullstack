import React from 'react'
import { Button } from './button';

function ButtonShowcase() {
  return (
    <>
     <div className="p-10 bg-slate-50 min-h-screen">
           <h1 className="text-3xl font-bold mb-6 text-slate-800">Button Component Showcase</h1>
           
           <div className="flex flex-wrap items-start gap-6">
             {/* --- Primary Variants --- */}
             <div className="flex flex-col items-start gap-4 p-4 border rounded-lg bg-white shadow-sm">
               <h2 className="font-semibold text-slate-600">Primary</h2>
               <Button variant="primary">Primary Button</Button>
               <Button variant="primary" size="sm">Small Primary</Button>
               <Button variant="primary" size="lg">Large Primary</Button>
               <Button variant="primaryOutline">Primary Outline</Button>
             </div>
     
             {/* --- Secondary Variants --- */}
             <div className="flex flex-col items-start gap-4 p-4 border rounded-lg bg-white shadow-sm">
               <h2 className="font-semibold text-slate-600">Secondary</h2>
               <Button variant="secondary">Secondary Button</Button>
               <Button variant="secondaryOutline">Secondary Outline</Button>
             </div>
     
             {/* --- Danger Variants --- */}
             <div className="flex flex-col items-start gap-4 p-4 border rounded-lg bg-white shadow-sm">
               <h2 className="font-semibold text-slate-600">Danger</h2>
               <Button variant="danger">Danger Button</Button>
               <Button variant="dangerOutline">Danger Outline</Button>
             </div>
             
             {/* --- Other Variants --- */}
             <div className="flex flex-col items-start gap-4 p-4 border rounded-lg bg-white shadow-sm">
               <h2 className="font-semibold text-slate-600">Miscellaneous</h2>
               <Button variant="default">Default</Button>
               <Button variant="super">Super</Button>
               <Button variant="ghost">Ghost</Button>
               <Button variant="locked">Locked</Button>
             </div>
     
             {/* --- Special Shapes & Sizes --- */}
             <div className="flex flex-col items-start gap-4 p-4 border rounded-lg bg-white shadow-sm">
               <h2 className="font-semibold text-slate-600">Shapes & Sizes</h2>
               <Button variant="primary" size="icon">
                 {/* SVG icon example */}
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
               </Button>
               <Button variant="primary" size="icon" rounded>
                  {/* SVG icon example */}
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
               </Button>
                <Button variant="super" rounded>Rounded</Button>
             </div>
           </div>
         </div> 
    </>
  )
}

export default ButtonShowcase
