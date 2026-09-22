"""Fills in the `en` side of codes.json's `title`/`details`/`name`/`label` fields, each shaped
`{"es": "...", "en": "..."}` (source of truth stays Spanish — see LocalizedText.localized in
Models.swift, which picks `en` on an English-language device and falls back to `es` when `en`
is nil/untranslated).

Re-run after adding new codes/groups to codes.json: any id/group/category name not covered here
prints under "missing" instead of failing silently, so it's safe to run repeatedly. Add its
translation to the relevant dict above and re-run.
"""
import json
from pathlib import Path

path = Path(__file__).resolve().parent.parent.parent / "qvacell-ios" / "Qvacell" / "codes.json"
d = json.load(open(path, encoding="utf-8"))

CAT_NAMES = {
    "home": "Home",
    "purchase": "Purchases",
    "helplines": "Helplines",
    "sms": "SMS Services",
}

GROUP_NAMES = {
    "Saldo y Planes": "Balance and Plans",
    "Transferir": "Transfer",
    "Recargar": "Recharge",
    "Servicio Adelanta Saldo": "Balance Advance Service",
    "Gestionar Plan Amigo": "Manage Friends Plan",
    "Configuraciones": "Settings",
    "Opciones": "Options",
    "Datos": "Data",
    "Planes Combinados": "Combo Plans",
    "SMS": "SMS",
    "Voz": "Voice",
    "Emergencias y Seguridad": "Emergency and Safety",
    "Servicios Básicos del Hogar": "Basic Home Services",
    "Servicios ETECSA y Teléfono": "ETECSA and Phone Services",
    "Quejas y Atención Ciudadana": "Complaints and Citizen Services",
    "Consultas": "Queries",
    "DHL y Vuelos": "DHL and Flights",
    "Tarifas y Servicios": "Rates and Services",
    "Deportes": "Sports",
    "Noticias": "News",
    "Recetas, Frases y Horóscopos": "Recipes, Quotes and Horoscopes",
}

VARIANT_LABELS = {
    "Resultados": "Results",
    "Posiciones": "Standings",
    "Goleadores": "Top Scorers",
}

CODES = {
    "main-balance": ("Main Balance", "Check your balance, minutes, SMS and data."),
    "bonus-usd-plans": ("USD Bonuses and Plans", "Check your USD bonuses and plans."),
    "data-plan": ("Data Plan", "Check your contracted data plan."),
    "voice-balance": ("Voice Plan or Minutes", "Check your voice plan or minutes."),
    "sms-balance": ("SMS Plan", "Check your SMS plan."),
    "national-recharge-limit": ("National Recharge Limit", "Check the status of your national recharge limit (360 CUP per 30 days)."),
    "postpaid-balance": ("Postpaid or Institutional Balance", "Check your postpaid or institutional balance."),
    "friends-plan": ("Friends Plan Status", "Check the status of your Friends Plan."),
    "transfer-direct": ("Transfer Balance", "Transfer balance to another number with your transfer PIN."),
    "transfer-pin-change": ("Change Transfer PIN", "Change the PIN you use to transfer balance to other numbers."),
    "recharge-card": ("Recharge with Card", "Recharge your balance with a prepaid card."),
    "recharge-call": ("Recharge by Call", "Recharge your balance by calling this number."),
    "advance-balance-25": ("$25.00", "Advance $25 of balance."),
    "advance-balance-50": ("$50.00", "Advance $50 of balance."),
    "friends-plan-activate": ("Activate Friends Plan", "Activate the Friends Plan for $25."),
    "friends-plan-deactivate": ("Deactivate Friends Plan", "Deactivate the Friends Plan."),
    "friends-plan-add-member": ("Add Friend to Plan", "Add a number to your Friends Plan."),
    "friends-plan-remove-member": ("Remove Friend from Plan", "Remove a number from your Friends Plan."),
    "friends-plan-status-settings": ("Check Friends Plan", "Check the status of your Friends Plan."),
    "sms-2266-lte": ("Activate 4G (LTE) Line", "Activates your line for browsing on 4G/LTE."),
    "sms-2266-imei": ("Check 3G/4G Compatibility", "Send the first 8 digits of your IMEI to find out if your phone supports 3G or 4G."),
    "sms-4222-mms-config": ("Set Up MMS", "Send the first 9 digits of your email to 4222 to set up MMS."),
    "data-pay-per-use": ("Pay-Per-Use Data (Enable/Disable)", "Enable data billed by usage, with no fixed plan."),
    "data-bundle-45gb": ("4.5GB Plan", "4.5GB of data."),
    "data-daily-plan": ("Daily 200MB Plan", "200MB per day."),
    "data-todus-plan": ("ToDus Plan", "Data for the ToDus app."),
    "data-bundle-2gb-combo": ("2GB + 15MIN + 20SMS", "Data, minutes and SMS in a single combo."),
    "data-bundle-4gb-combo": ("4GB + 35MIN + 40SMS", "Data, minutes and SMS in a single combo."),
    "data-bundle-6gb-combo": ("6GB + 60MIN + 70SMS", "Data, minutes and SMS in a single combo."),
    "sms-bundle-20": ("20 SMS Plan", "20 SMS."),
    "sms-bundle-50": ("50 SMS Plan", "50 SMS."),
    "sms-bundle-90": ("90 SMS Plan", "90 SMS."),
    "sms-bundle-120": ("120 SMS Plan", "120 SMS."),
    "voice-bundle-5min": ("5 MIN Plan", "5 minutes."),
    "voice-bundle-10min": ("10 MIN Plan", "10 minutes."),
    "voice-bundle-15min": ("15 MIN Plan", "15 minutes."),
    "voice-bundle-25min": ("25 MIN Plan", "25 minutes."),
    "voice-bundle-40min": ("40 MIN Plan", "40 minutes."),
    "voicemail": ("Voicemail", "Access your voicemail."),
    "customer-service": ("Customer Service", "Support, questions, or activate voicemail on your phone."),
    "emergency-antidrugs": ("Anti-Drug Hotline", "Addiction support."),
    "emergency-ambulance": ("Ambulance (SIUM)", "Ambulance service."),
    "emergency-firefighters": ("Fire Department", "Also for serious gas leaks."),
    "emergency-police": ("National Police (PNR)", "Revolutionary National Police."),
    "emergency-coastguard": ("Maritime Rescue", "Border Guard Troops."),
    "home-electricity": ("Power Outages (UNE)", "Report power outages and faults."),
    "home-water": ("Water Leaks", "Leaks and burst pipes (Aqueduct)."),
    "home-gas": ("Gas Leaks", "Manufactured gas — direct line in Havana."),
    "etecsa-assisted-calls": ("Assisted Calls", "Manage assisted calls, domestic and international."),
    "etecsa-directory": ("Directory Assistance", "To request a number."),
    "etecsa-landline-report": ("Landline Faults", "Report landline service interruptions."),
    "etecsa-general-info": ("ETECSA General Information", "General information and commercial procedures."),
    "etecsa-time-signal": ("Time Signal", "The exact time."),
    "etecsa-commercial": ("ETECSA Customer Service", "Unified customer service."),
    "complaints-mininit": ("Citizen Services (MININT)", "Reports or complaints about police."),
    "complaints-prosecutor": ("Attorney General's Office", "Legal guidance and legality complaints."),
    "complaints-mail": ("Correos de Cuba", "Single toll-free line for packages and money orders."),
    "sms-2266-ayuda": ("Help", 'Send "ayuda" to 2266 to see the available SMS commands.'),
    "sms-2266-planes": ("Plans", "Check available plans by SMS."),
    "sms-2266-amigo": ("Friends Plan", "Check the status of your Friends Plan by SMS."),
    "sms-2266-resumen": ("Credit Summary", "Check your credit summary by SMS."),
    "sms-8888-dhl": ("DHL Tracking", "Send your DHL tracking number by SMS to track your shipment."),
    "sms-8888-vuelo": ("Flight Information", "Send the flight number by SMS to check its information."),
    "sms-8000-follow": ("Newsletter", "Subscribe to the newsletter by SMS."),
    "sms-8000-onat": ("ONAT Service", "Subscribe to the ONAT service by SMS."),
    "sms-8000-turismo": ("Tourism Service", "Subscribe to the tourism service by SMS."),
    "sms-8888-embajada": ("Embassy Information", "Send your query by SMS to get embassy information."),
    "sms-8888-cambio": ("Currency Exchange", 'Check the exchange rate by SMS — enter a currency and, optionally, an amount (e.g. "EUR 120"), or leave it blank for the general rate.'),
    "sms-2266-oferta": ("ETECSA Offers", "Check current ETECSA offers by SMS."),
    "sms-2266-tarifa": ("ETECSA Rates", "Check your current ETECSA rate by SMS."),
    "sms-8888-telectrica": ("Electricity Rate", "Send your consumption rate by SMS to calculate the electricity rate."),
    "sms-8888-pelota": ("Cuban Baseball", "Choose what to check about Cuban baseball by SMS."),
    "sms-8888-mlb": ("MLB (Major Leagues)", "Choose what to check about the Major Leagues by SMS."),
    "sms-8888-bundesliga": ("Bundesliga", "Choose what to check about Bundesliga results by SMS."),
    "sms-8888-chanpion": ("Champions League", "Choose what to check about Champions League results by SMS."),
    "sms-8888-rey": ("Copa del Rey", "Choose what to check about Copa del Rey results by SMS."),
    "sms-8888-liga1": ("LaLiga", "Choose what to check about LaLiga results by SMS."),
    "sms-8888-premier": ("Premier League", "Choose what to check about Premier League results by SMS."),
    "sms-8888-seriea": ("Serie A", "Choose what to check about Serie A results by SMS."),
    "sms-8888-tiempo": ("Weather (General)", "Check the weather forecast by SMS."),
    "sms-8888-tiempo-zona": ("Weather by Zone", "Check the weather forecast for a specific zone by SMS — e.g. OCC, CEN, ORI, or a province like Camagüey, Holguín, Santiago de Cuba, Cayo Coco..."),
    "sms-8888-noticias": ("News", "Check the latest news by SMS."),
    "sms-8888-titulares": ("Headlines", "Check the headlines by SMS."),
    "sms-8888-pl": ("Prensa Latina", "Check Prensa Latina news by SMS."),
    "sms-8100-marti": ("Martí", "Subscribe to the Martí service by SMS."),
    "sms-8100-cubadebate": ("Cubadebate", "Subscribe to Cubadebate by SMS."),
    "sms-8100-cdeportes": ("Cubadeportes", "Subscribe to Cubadeportes by SMS."),
    "sms-8100-granma": ("Granma", "Subscribe to the Granma newspaper by SMS."),
    "sms-8100-pl": ("Prensa Latina", "Subscribe to Prensa Latina by SMS."),
    "sms-8888-receta": ("Cooking Recipes", "Choose a category and get a recipe by SMS."),
    "sms-8888-frases": ("Quotes and Poems", "Choose a topic and get a quote or poem by SMS."),
    "sms-8888-horoscopo": ("Traditional Horoscope", "Choose your sign and get your horoscope by SMS."),
    "sms-8888-horoscopo-chino": ("Chinese Horoscope", "Choose your Chinese zodiac sign and get your horoscope by SMS."),
}

missing_codes = []
missing_groups = []
missing_cats = []

for cat in d["categories"]:
    cat_en = CAT_NAMES.get(cat["id"])
    if cat_en is None:
        missing_cats.append(cat["id"])
    else:
        cat["name"]["en"] = cat_en
    for g in cat.get("groups", []):
        if g.get("name") is not None:
            g_en = GROUP_NAMES.get(g["name"]["es"])
            if g_en is None:
                missing_groups.append(g["name"]["es"])
            else:
                g["name"]["en"] = g_en
        for c in g.get("codes", []):
            entry = CODES.get(c["id"])
            if entry is None:
                missing_codes.append(c["id"])
            else:
                c["title"]["en"], c["details"]["en"] = entry
            for v in c.get("variants") or []:
                v_en = VARIANT_LABELS.get(v["label"]["es"])
                if v_en:
                    v["label"]["en"] = v_en

print("missing categories:", missing_cats)
print("missing groups:", missing_groups)
print("missing codes:", missing_codes)

with open(path, "w", encoding="utf-8") as f:
    json.dump(d, f, ensure_ascii=False, indent=2)
    f.write("\n")
