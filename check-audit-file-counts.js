const fs = require('fs');

async function main() {
  const content = fs.readFileSync('vehicle-images-audit.txt', 'utf8');
  const audit = JSON.parse(content);
  
  console.log(`Vehicles in dump: ${audit.vehicles.length}`);
  console.log(`Images in dump: ${audit.images.length}`);
  
  const counts = {};
  audit.images.forEach(img => {
    const v = audit.vehicles.find(veh => veh.id === img.vehicleId);
    const brand = v ? v.brand : 'Unknown';
    counts[brand] = (counts[brand] || 0) + 1;
  });
  console.log('Brand counts in dump:', counts);
}

main().catch(console.error);
