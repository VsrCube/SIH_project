# backend/api/chroma_service.py
import math
import os
from typing import List, Dict, Any

# Verified Master Geological Corpus for ChromaDB Vector Indexing
GEOLOGICAL_CHUNKS = [
    {
        "token_id": "CHK-BAR-02",
        "doc_id": "DOC-BARAKAR-01",
        "title": "Barakar Formation Stratigraphy & Core Assays (Jharia Coalfield)",
        "page_number": 2,
        "category": "Geotechnical / Stratigraphy",
        "keywords": ["barakar", "sandstone", "ucs", "rqd", "compressive strength", "jharia", "seam", "roof", "modulus"],
        "text": (
            "Laboratory Unconfined Compressive Strength (UCS) testing on NX core specimens from Barakar sandstone "
            "yielded a mean compressive strength of 42.8 MPa (range: 38.5 to 46.2 MPa). Immediate roof RQD above Seam XI "
            "averages 78% (Fair to Good roof condition). Tensile strength is 3.8 MPa and Young's modulus is 14.6 GPa, "
            "with Poisson's ratio measured at 0.22."
        ),
        "current_status": (
            "• Immediate Roof Classification: Fair to Good Strata (RQD: 78%)\n"
            "• Geomechanical Metrics: Mean Unconfined Compressive Strength (UCS) = 42.8 MPa (Range: 38.5 – 46.2 MPa)\n"
            "• Elastic Modulus & Tensile Properties: Young's Modulus (E) = 14.6 GPa, Tensile Strength = 3.8 MPa, Poisson's Ratio (ν) = 0.22\n"
            "• Geotechnical Assessment: Competent quartzose sandstone matrix capable of supporting standard bord-and-pillar galleries under prescribed Systematic Support Rules (SSR)."
        ),
        "history": (
            "The Barakar Formation represents the primary coal-bearing stratigraphic interval of the Lower Gondwana Group (Early Permian epoch). "
            "Formed in fluvial channel and floodplain-lacustrine depositional environments. In Jharia Coalfield Sector 4, exploratory borehole logs "
            "and historical extraction across Seams IX through XVI document multi-seam strata behavior with predictable interseam parting."
        ),
        "additional": (
            "• Statutory Compliance: Mandatory adherence to DGMS Coal Mines Regulations (CMR) 2017 Regulation 111 & Circular 04 of 2023.\n"
            "• Strata Control Monitoring: Continuous convergence monitoring using dual-height tell-tales and magnetic multi-point extensometers.\n"
            "• Support Density: Fully resin-grouted roof bolts (22mm dia, 1.8m length) installed in 1.2m x 1.2m grid pattern, supplemented by hydraulic props during depillaring operations."
        )
    },
    {
        "token_id": "CHK-DGMS-01",
        "doc_id": "DOC-DGMS-02",
        "title": "DGMS Circular No. 04 of 2023: Coal Pillar Extraction & Strata Standards",
        "page_number": 4,
        "category": "Regulatory / DGMS Safety",
        "keywords": ["dgms", "regulation 111", "pillar", "safety", "ssr", "support", "circular", "cmr", "depillaring"],
        "text": (
            "DGMS Circular No. 04 of 2023 under Coal Mines Regulations (CMR) 2017 Regulation 111 dictates minimum "
            "coal pillar dimensions of 2.4m width in bord-and-pillar galleries. Requires mandatory Systematic Support Rules (SSR) "
            "and hydraulic props before clearing coal during extraction."
        ),
        "current_status": (
            "• Regulatory Status: Active Statutory Directive enforced by Directorate General of Mines Safety (DGMS).\n"
            "• Mandatory Pillar Geometry: Minimum coal pillar width strictly maintained at 2.4m for standard galleries; dimensions scale up with working depth under CMR 2017 Regulation 111.\n"
            "• Enforcement Protocol: Real-time digital verification of gallery spans and pillar dimensions prior to sanctioning depillaring."
        ),
        "history": (
            "Promulgated following DGMS national safety audits in deep mechanized mines to mitigate risk of catastrophic air blasts, "
            "sudden pillar spalling, and unpredicted main roof collapse during continuous miner extraction and caving cycles."
        ),
        "additional": (
            "• Statutory Mandate: Mining operations violating SSR guidelines or prescribed support densities face immediate statutory stop-work notices under Section 22(3) of the Mines Act, 1952.\n"
            "• Support Specifications: Fast-setting resin bolts with minimum 100 kN anchorage capacity, combined with W-straps in unstable roof junctions."
        )
    },
    {
        "token_id": "CHK-JHARIA-03",
        "doc_id": "DOC-JHARIA-03",
        "title": "Jharia Coalfield Sector 4 Stratigraphy & Seam Thickness Report",
        "page_number": 1,
        "category": "Stratigraphy / Seam Analysis",
        "keywords": ["jharia", "sector 4", "seam", "thickness", "coalfield", "ash content", "coking", "volatile", "gassy"],
        "text": (
            "Jharia Coalfield Sector 4 borehole core data shows prime coking coal Seam X with average thickness of 8.45m "
            "at 180m depth. Ash content averages 16.2% with volatile matter at 24.8%. Roof consists of massive quartz arenite sandstone."
        ),
        "current_status": (
            "• Seam Identification & Geometry: Seam X (Prime Coking Coal) verified with mean seam thickness of 8.45 meters at 180m working depth.\n"
            "• Coal Quality Assay: Raw Ash Content = 16.2%, Volatile Matter = 24.8%, Fixed Carbon = 59.0%, Moisture = 1.8%.\n"
            "• Roof & Floor Lithology: Massive quartz arenite sandstone roof (Grade I competent) with carbonaceous shale immediate floor.\n"
            "• Mine Gassiness Rating: Classified as Degree-II Gassy Mine under DGMS statutory classification."
        ),
        "history": (
            "Sector 4 forms the central synclinal trough of the Damodar Valley Coal Basin. Intensive exploratory drilling completed in 2018 "
            "confirmed Jharia as India's premier metallurgical coking coal repository supplying domestic steel plants."
        ),
        "additional": (
            "• Statutory Methane Safety: Continuous digital telemetric methane sensors (CH₄) mandatory at main return airways and face headers under CMR 2017.\n"
            "• Spontaneous Combustion Prevention: Regular carbon monoxide (CO) monitoring and nitrogen flushing protocols required in sealed goaf areas."
        )
    },
    {
        "token_id": "CHK-RANI-02",
        "doc_id": "DOC-RANIGANJ-04",
        "title": "Raniganj Basin Borehole BH-42 Hydrogeological Inrush Assessment",
        "page_number": 3,
        "category": "Hydrogeology / Inrush Risk",
        "keywords": ["raniganj", "bh-42", "aquifer", "inrush", "hydrogeology", "water", "pressure", "artesian", "grouting"],
        "text": (
            "Raniganj Basin Borehole BH-42 intercepted a pressurized artesian aquifer at 145m depth. Static hydrostatic "
            "pressure measured at 4.2 bar with potential water inrush rate of 120 m3/hour. Requires advance pilot drilling and cement pressure grouting."
        ),
        "current_status": (
            "• Hydrogeological Threat Level: High-Pressure Artesian Aquifer Intercepted at 145 meters depth.\n"
            "• Hydrostatic Pressure & Inflow: Static pressure measured at 4.2 bar; calculated inrush discharge rate up to 120 m³/hour.\n"
            "• Operational Status: Immediate active hazard alert in place for advance underground gallery drivage."
        ),
        "history": (
            "The eastern boundary of Raniganj Coalfield has a history of interconnected fault-induced water inrushes (e.g. 2014 regional inundation event). "
            "Exploratory logging across BH-42 established secondary permeability along NW-SE trending fault zones."
        ),
        "additional": (
            "• Statutory Inrush Precaution: Mandatory 30-meter advance pilot probe drilling (ahead of gallery face) using long-hole percussion rigs under CMR 2017 Regulation 149.\n"
            "• Remediation Protocol: High-pressure chemical and micro-fine cementitious grouting at minimum 8.0 bar pump pressure until zero-flow cutoff is achieved."
        )
    },
    {
        "token_id": "CHK-MAHA-01",
        "doc_id": "DOC-MAHANADI-05",
        "title": "Mahanadi Basin CBM Exploration & Gas Desorption Evaluation",
        "page_number": 5,
        "category": "CBM / Reservoir Engineering",
        "keywords": ["mahanadi", "cbm", "methane", "desorption", "gas", "purity", "reservoir", "permeability", "langmuir"],
        "text": (
            "Mahanadi Basin exploration core tests confirmed 98.2% pure methane (CH4) gas purity with gas content of "
            "14.5 m3/ton at 450m depth. Langmuir volume is 22.4 m3/ton with permeability of 3.2 mD."
        ),
        "current_status": (
            "• Gas Quality & Composition: 98.2% pure Methane (CH₄) gas purity with negligible non-hydrocarbon contaminants.\n"
            "• In-Situ Gas Content: 14.5 m³/ton at 450 meters exploratory core depth.\n"
            "• Reservoir Dynamics: Langmuir Isotherm Volume (VL) = 22.4 m³/ton, Seam Cleat Permeability = 3.2 mD.\n"
            "• Commercial Viability: Confirmed high-grade commercial Coal Bed Methane (CBM) prospective reservoir."
        ),
        "history": (
            "Exploratory core drilling commenced in 2021 under India's National Clean Energy Coal-Bed Methane Assessment initiative, "
            "targeting deeply buried Gondwana coal measures within the Mahanadi Master Basin."
        ),
        "additional": (
            "• Extraction Roadmap: Multistage hydraulic fracturing and controlled reservoir dewatering program scheduled to initiate peak gas desorption.\n"
            "• Statutory DGMS Compliance: Environmental clearance from DGMS and MoEFCC required prior to commercial gas venting, flaring, or surface gathering line connection."
        )
    }
]

def search_chroma_vectors(query_text: str, top_k: int = 2) -> List[Dict[str, Any]]:
    """
    Step 2: Vector search in ChromaDB to retrieve matching geological chunks,
    token IDs, and page numbers. Only returns chunks with positive semantic/keyword relevance.
    """
    query_lower = query_text.lower().strip()
    if not query_lower:
        return []
    
    # Keyword & Semantic scoring simulation against ChromaDB vector index
    scored_chunks = []
    for chunk in GEOLOGICAL_CHUNKS:
        score = 0.0
        for kw in chunk["keywords"]:
            if kw in query_lower:
                score += 2.0
        # Partial word matches
        words = [w for w in query_lower.split() if len(w) > 3]
        for word in words:
            if word in chunk["title"].lower():
                score += 1.5
            elif word in chunk["text"].lower():
                score += 0.75

        if score > 0.5:
            scored_chunks.append((score, chunk))

    # Sort by relevance score
    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    
    if scored_chunks:
        return [item[1] for item in scored_chunks[:top_k]]
    
    return []

