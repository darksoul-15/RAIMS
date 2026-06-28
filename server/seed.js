// server/seed.js
const User = require('./models/User');
const Project = require('./models/Project');
const Location = require('./models/Location');
const Asset = require('./models/Asset');
const Procurement = require('./models/Procurement');
const Notification = require('./models/Notification');

const LOCATIONS = [
  { name: 'Electronics Lab', type: 'Lab', description: 'Electronics components and equipment' },
  { name: 'Robotics Lab', type: 'Lab', description: 'Robotics tools and parts' },
  { name: 'Media Room', type: 'Studio', description: 'Media production equipment' },
  { name: 'Storage Room', type: 'Storage', description: 'General asset storage' },
  { name: 'Project Team', type: 'Team', description: 'Assets assigned to project teams' }
];

const DEFAULT_USERS = [
  { name: 'Admin User', email: 'admin@re-org.com', password: 'Admin@1234', role: 'Administrator' },
  { name: 'Resource Manager', email: 'rm@re-org.com', password: 'Admin@1234', role: 'ResourceManager' },
  { name: 'Project Lead', email: 'lead@re-org.com', password: 'Admin@1234', role: 'ProjectLead' },
  { name: 'Researcher One', email: 'researcher@re-org.com', password: 'Admin@1234', role: 'Researcher' }
];

const DEFAULT_PROJECTS = [
  { name: 'Robotics Initiative', description: 'Autonomous robotics research' },
  { name: 'Electronics Research', description: 'Circuit design and embedded systems' },
  { name: 'Media Production', description: 'Documentary and content creation' }
];

const ASSETS = [
  { assetCode: 'AST-0001', name: 'Arduino Uno R3', category: 'Electronics', description: 'ATmega328P microcontroller board.', quantityTotal: 25, quantityAvailable: 18, purchaseCost: 23.5, vendor: { name: 'Robu.in', contact: 'sales@robu.in' }, warranty: { period: '1 year' }, status: 'Available', locationName: 'Electronics Lab' },
  { assetCode: 'AST-0002', name: 'Raspberry Pi 5 (8GB)', category: 'Computing', description: 'Single-board computer, quad-core 8GB.', quantityTotal: 12, quantityAvailable: 4, purchaseCost: 89, vendor: { name: 'Element14' }, warranty: { period: '1 year' }, status: 'Available', locationName: 'Storage Room' },
  { assetCode: 'AST-0003', name: 'Dynamixel AX-12A Servo', category: 'Robotics', description: 'Smart serial servo for robotics.', quantityTotal: 20, quantityAvailable: 0, purchaseCost: 44.9, vendor: { name: 'Trossen Robotics' }, warranty: { period: '6 months' }, status: 'Borrowed', locationName: 'Robotics Lab' },
  { assetCode: 'AST-0004', name: 'Sony A7 III Camera', category: 'Media', description: 'Full-frame mirrorless camera.', quantityTotal: 3, quantityAvailable: 2, purchaseCost: 1999, vendor: { name: 'B&H Photo' }, warranty: { period: '2 years' }, status: 'Reserved', locationName: 'Media Room' },
  { assetCode: 'AST-0005', name: 'Soldering Station (Hakko FX-888D)', category: 'Electronics', description: 'Digital temp-controlled soldering station.', quantityTotal: 8, quantityAvailable: 6, purchaseCost: 129, vendor: { name: 'Hakko' }, warranty: { period: '1 year' }, status: 'Available', locationName: 'Electronics Lab' },
  { assetCode: 'AST-0006', name: 'NVIDIA Jetson Nano Dev Kit', category: 'Computing', description: 'Edge-AI development board.', quantityTotal: 6, quantityAvailable: 1, purchaseCost: 149, vendor: { name: 'Seeed Studio' }, warranty: { period: '1 year' }, status: 'Available', locationName: 'Storage Room' },
  { assetCode: 'AST-0007', name: '3D Printer (Prusa MK4)', category: 'Design', description: 'FDM 3D printer for prototyping.', quantityTotal: 2, quantityAvailable: 0, purchaseCost: 1099, vendor: { name: 'Prusa Research' }, warranty: { period: '2 years' }, status: 'UnderMaintenance', locationName: 'Storage Room' },
  { assetCode: 'AST-0008', name: 'Oscilloscope (Rigol DS1054Z)', category: 'Electronics', description: '4-channel 50MHz digital oscilloscope.', quantityTotal: 4, quantityAvailable: 3, purchaseCost: 339, vendor: { name: 'Rigol' }, warranty: { period: '3 years' }, status: 'Available', locationName: 'Electronics Lab' }
];

const runSeed = async () => {
  try {
    // ── Locations ──────────────────────────────────────────
    for (const loc of LOCATIONS) {
      const exists = await Location.findOne({ name: loc.name });
      if (!exists) await Location.create(loc);
    }

    // ── Users ──────────────────────────────────────────────
    for (const u of DEFAULT_USERS) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const user = new User({ name: u.name, email: u.email, role: u.role });
        await user.setPassword(u.password);
        await user.save();
      }
    }

    // ── Projects (assign lead after users exist) ───────────
    const leadUser = await User.findOne({ role: 'ProjectLead' });
    for (const p of DEFAULT_PROJECTS) {
      const exists = await Project.findOne({ name: p.name });
      if (!exists) await Project.create({ ...p, lead: leadUser?._id });
    }

    // ── Assets ─────────────────────────────────────────────
    const adminUser = await User.findOne({ role: 'Administrator' });
    for (const a of ASSETS) {
      const exists = await Asset.findOne({ assetCode: a.assetCode });
      if (!exists) {
        const loc = await Location.findOne({ name: a.locationName });
        const { locationName, ...assetData } = a;
        await Asset.create({ ...assetData, storageLocation: loc?._id, createdBy: adminUser?._id });
      }
    }

    // ── Procurements ───────────────────────────────────────
    const procCount = await Procurement.countDocuments();
    if (procCount === 0) {
      const [ast1, ast2, ast4, ast5, ast7] = await Promise.all([
        Asset.findOne({ assetCode: 'AST-0001' }),
        Asset.findOne({ assetCode: 'AST-0002' }),
        Asset.findOne({ assetCode: 'AST-0004' }),
        Asset.findOne({ assetCode: 'AST-0005' }),
        Asset.findOne({ assetCode: 'AST-0007' })
      ]);
      await Procurement.insertMany([
        { asset: ast1?._id, purchaseDate: '2025-01-15', purchaseCost: 587.5,  vendorName: 'Robu.in',               vendorContact: 'sales@robu.in',       warrantyPeriod: '1 year', purchaseOrderRef: 'PO-2025-001', category: 'Electronics', notes: 'Bulk order — 25 units', createdBy: adminUser?._id },
        { asset: ast2?._id, purchaseDate: '2025-02-02', purchaseCost: 1068,   vendorName: 'Element14',             vendorContact: 'support@element14.com',warrantyPeriod: '1 year', purchaseOrderRef: 'PO-2025-007', category: 'Computing',   notes: '12 units for lab refresh',  createdBy: adminUser?._id },
        { asset: ast4?._id, purchaseDate: '2024-09-10', purchaseCost: 5997,   vendorName: 'B&H Photo',             vendorContact: 'orders@bhphoto.com',   warrantyPeriod: '2 years',purchaseOrderRef: 'PO-2024-042', category: 'Media',       notes: '3 camera bodies',           createdBy: adminUser?._id },
        { asset: ast5?._id, purchaseDate: '2024-12-01', purchaseCost: 1032,   vendorName: 'Hakko',                 vendorContact: '',                     warrantyPeriod: '1 year', purchaseOrderRef: 'PO-2024-055', category: 'Electronics', notes: '8 units',                   createdBy: adminUser?._id },
        { asset: ast7?._id, purchaseDate: '2024-08-18', purchaseCost: 2198,   vendorName: 'Prusa Research',        vendorContact: 'sales@prusa3d.com',    warrantyPeriod: '2 years',purchaseOrderRef: 'PO-2024-031', category: 'Design',      notes: '2 units for prototyping',   createdBy: adminUser?._id },
        { asset: null,       purchaseDate: '2026-05-18', purchaseCost: 320,    vendorName: 'DigiKey',               vendorContact: 'support@digikey.com',  warrantyPeriod: '',       purchaseOrderRef: 'PO-2026-015', category: 'Electronics', notes: 'Consumables — resistors, capacitors', createdBy: adminUser?._id },
        { asset: null,       purchaseDate: '2026-06-01', purchaseCost: 450,    vendorName: 'Annual Maintenance Corp',vendorContact: '',                    warrantyPeriod: '',       purchaseOrderRef: 'PO-2026-019', category: 'Services',    notes: 'Annual calibration service', createdBy: adminUser?._id }
      ]);
    }

    // ── Notifications ──────────────────────────────────────
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      const rm  = await User.findOne({ role: 'ResourceManager' });
      const res = await User.findOne({ role: 'Researcher' });
      const pl  = await User.findOne({ role: 'ProjectLead' });
      if (rm && res && pl) {
        await Notification.insertMany([
          { recipient: rm._id,  type: 'ApprovalRequest',      message: 'A new asset request is pending your approval.',           relatedEntityType: 'Request',  channel: 'Dashboard', read: false },
          { recipient: rm._id,  type: 'OverdueAlert',         message: 'An asset checkout is overdue. Please follow up.',          relatedEntityType: 'Checkout', channel: 'Dashboard', read: false },
          { recipient: res._id, type: 'CheckoutConfirmation',  message: 'Your checkout has been confirmed.',                        relatedEntityType: 'Checkout', channel: 'Dashboard', read: false },
          { recipient: res._id, type: 'ReturnReminder',        message: 'Your borrowed asset is due back in 2 days.',               relatedEntityType: 'Checkout', channel: 'Dashboard', read: false },
          { recipient: pl._id,  type: 'ApprovalRequest',      message: 'A team member request requires your approval.',            relatedEntityType: 'Request',  channel: 'Dashboard', read: false },
          { recipient: res._id, type: 'ApprovalRequest',      message: 'Your request was rejected. Check notes for details.',      relatedEntityType: 'Request',  channel: 'Dashboard', read: true  },
          { recipient: rm._id,  type: 'InventoryUpdate',      message: '3D Printer status changed to Under Maintenance.',          relatedEntityType: 'Asset',    channel: 'Dashboard', read: true  },
          { recipient: adminUser?._id, type: 'OverdueAlert',  message: 'A borrower has not returned an asset past due date.',      relatedEntityType: 'Checkout', channel: 'Dashboard', read: false }
        ]);
      }
    }

    console.log('✅ Seed check complete');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

module.exports = runSeed;
