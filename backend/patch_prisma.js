const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!content.includes('model labs {')) {
  // Add to users
  content = content.replace('model users {', 'model users {\\n  labs                          labs?');

  // Add to addresses
  content = content.replace('model addresses {', 'model addresses {\\n  labs                      labs[]');

  // Add to clinics
  content = content.replace('model clinics {', 'model clinics {\\n  clinic_lab_mapping     clinic_lab_mapping[]');

  const newModels = `

model labs {
  lab_id              Int                  @id @default(autoincrement())
  user_id             Int?                 @unique
  name                String               @db.VarChar
  owner_name          String?              @db.VarChar
  lab_type            String?              @db.VarChar
  registration_number String?              @db.VarChar
  establishment_year  Int?
  contact_number      String?              @db.VarChar
  email               String?              @db.VarChar
  address_id          Int?
  license_number      String?              @db.VarChar
  gst_number          String?              @db.VarChar
  certification       String?              @db.VarChar
  created_at          DateTime?            @default(now()) @db.Timestamp(6)
  users               users?               @relation(fields: [user_id], references: [user_id], onDelete: NoAction, onUpdate: NoAction)
  address             addresses?           @relation(fields: [address_id], references: [address_id], onDelete: NoAction, onUpdate: NoAction)
  lab_tests           lab_tests[]
  clinic_lab_mapping  clinic_lab_mapping[]
}

model lab_tests {
  test_id         Int       @id @default(autoincrement())
  lab_id          Int
  test_name       String    @db.VarChar
  category        String?   @db.VarChar
  price           Decimal?  @db.Decimal
  report_time     String?   @db.VarChar
  home_collection Boolean?  @default(false)
  labs            labs      @relation(fields: [lab_id], references: [lab_id], onDelete: Cascade, onUpdate: NoAction)
}

model clinic_lab_mapping {
  id             Int       @id @default(autoincrement())
  clinic_id      Int
  lab_id         Int?
  manual_name    String?   @db.VarChar
  manual_contact String?   @db.VarChar
  manual_address String?
  manual_tests   String?
  mapping_type   String    @db.VarChar
  created_at     DateTime? @default(now()) @db.Timestamp(6)
  clinics        clinics   @relation(fields: [clinic_id], references: [id], onDelete: Cascade, onUpdate: NoAction)
  labs           labs?     @relation(fields: [lab_id], references: [lab_id], onDelete: Cascade, onUpdate: NoAction)
}
`;
  content += newModels;
  fs.writeFileSync('prisma/schema.prisma', content);
  console.log('Added lab models to prisma schema');
} else {
  console.log('Lab models already exist in prisma schema');
}
