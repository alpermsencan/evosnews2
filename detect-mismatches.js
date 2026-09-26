const fs = require('fs');
const data = JSON.parse(fs.readFileSync('vehicle-images-audit.txt', 'utf8').substring(fs.readFileSync('vehicle-images-audit.txt', 'utf8').indexOf('[')));

const suspicious = [];
const crossModel = [];

data.forEach(v => {
  const modelLower = v.model.toLowerCase();
  
  v.syncImages.forEach(img => {
    const srcUrl = img.sourceUrl.toLowerCase();
    const publicId = img.cloudinaryPublicId.toLowerCase();
    
    // Check if the image belongs to a different model of the same brand
    if (v.brand === 'Hyundai') {
      const otherHyundaiModels = ['inster', 'kona', 'ioniq-5-n', 'ioniq-5', 'ioniq-6', 'ioniq-9'];
      const currentModelName = modelLower.replace(' elektrik', '').replace(/\s+/g, '-');
      
      otherHyundaiModels.forEach(other => {
        if (other !== currentModelName && other !== 'ioniq-5' && currentModelName !== 'ioniq-5-n') {
          // If the vehicle is Ioniq 6 but the image URL contains "inster", "kona", or "ioniq-5"
          if (srcUrl.includes(other) || publicId.includes(other)) {
            crossModel.push({
              vehicle: `${v.brand} ${v.model}`,
              imageModel: other,
              sourceUrl: img.sourceUrl,
              cloudinaryPublicId: img.cloudinaryPublicId
            });
          }
        }
      });
      
      // Special check for IONIQ 5 vs IONIQ 5 N
      if (currentModelName === 'ioniq-5' && (srcUrl.includes('ioniq-5-n') || srcUrl.includes('ioniq5n') || publicId.includes('ioniq-5-n') || publicId.includes('ioniq5n'))) {
        crossModel.push({
          vehicle: `${v.brand} ${v.model}`,
          imageModel: 'ioniq-5-n',
          sourceUrl: img.sourceUrl,
          cloudinaryPublicId: img.cloudinaryPublicId
        });
      }
    }
    
    if (v.brand === 'Kia') {
      const otherKiaModels = ['ev2', 'ev3', 'ev6', 'ev9', 'niro'];
      const currentModelName = modelLower.replace(' ev', '').replace(/\s+/g, '-');
      
      otherKiaModels.forEach(other => {
        if (other !== currentModelName) {
          if (srcUrl.includes(other) || publicId.includes(other)) {
            crossModel.push({
              vehicle: `${v.brand} ${v.model}`,
              imageModel: other,
              sourceUrl: img.sourceUrl,
              cloudinaryPublicId: img.cloudinaryPublicId
            });
          }
        }
      });
    }

    if (v.brand === 'BYD') {
      const otherBydModels = ['seal', 'sealion', 'tang', 'han'];
      const currentModelName = modelLower.replace(' excellence awd', '').replace(/\s+/g, '-');
      
      otherBydModels.forEach(other => {
        if (other !== currentModelName) {
          if (srcUrl.includes(other) || publicId.includes(other)) {
            // Note: sealion contains seal, so let's check carefully
            if (other === 'seal' && (srcUrl.includes('sealion') || publicId.includes('sealion'))) {
              return; // skip false positive
            }
            crossModel.push({
              vehicle: `${v.brand} ${v.model}`,
              imageModel: other,
              sourceUrl: img.sourceUrl,
              cloudinaryPublicId: img.cloudinaryPublicId
            });
          }
        }
      });
    }

    if (v.brand === 'Togg') {
      const otherToggModels = ['t10x', 't10f'];
      const currentModelName = modelLower.includes('t10x') ? 't10x' : 't10f';
      
      otherToggModels.forEach(other => {
        if (other !== currentModelName) {
          if (srcUrl.includes(other) || publicId.includes(other)) {
            crossModel.push({
              vehicle: `${v.brand} ${v.model}`,
              imageModel: other,
              sourceUrl: img.sourceUrl,
              cloudinaryPublicId: img.cloudinaryPublicId
            });
          }
        }
      });
    }
  });
});

console.log('--- DETECTED CROSS-MODEL IMAGES ---');
console.log(JSON.stringify(crossModel, null, 2));
