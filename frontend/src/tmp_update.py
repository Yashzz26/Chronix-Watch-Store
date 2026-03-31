from pathlib import Path
path = Path('Checkout.jsx')
text = path.read_text()
replacements = [
    ("{ label: 'Inventory', id: 'cart' }", "{ label: 'Cart', id: 'cart' }"),
    ("{ label: 'Logistics', id: 'address' }", "{ label: 'Address', id: 'address' }"),
    ("{ label: 'Settlement', id: 'payment' }", "{ label: 'Payment', id: 'payment' }"),
    ("toast.error('Satellite communication failed')", "toast.error('Location not available on this device')"),
    ("toast.loading('Synchronizing coordinates...')", "toast.loading('Locating you...')"),
    ("toast.success('Coordinates locked'", "toast.success('Address found'"),
    ("toast.error('Sync failure'", "toast.error(\"Couldn't fetch location\""),
    ("toast.error('Access denied'", "toast.error('Location permission blocked'"),
    ("toast.error('Credential required')", "toast.error('Enter a code first')"),
    ("toast.success(Access code accepted: % offset)", "toast.success(Code applied. % off)"),
    ("toast.error('Invalid credential')", "toast.error('Code not valid')"),
    ("toast.error('Verification offline')", "toast.error(\"Couldn't verify code\")"),
    ("toast.loading('Finalizing transaction...')", "toast.loading('Confirming payment...')"),
    ("toast.success('Acquisition complete'", "toast.success('Order placed'"),
    ("toast.success('Reservation confirmed')", "toast.success('Order placed')"),
    ("toast.error('Credentials incomplete')", "toast.error('Add your name and address first')"),
]
for old, new in replacements:
    if old not in text:
        raise SystemExit(f"pattern not found: {old}")
    text = text.replace(old, new)
path.write_text(text)
