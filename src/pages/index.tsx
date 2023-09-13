import React, {useState, useEffect} from 'react';

// UI imports
import {Checkbox} from 'baseui/checkbox';
import {Delete} from 'baseui/icon';
import {AppNavBar, setItemActive, NavItem} from 'baseui/app-nav-bar';
import {TableBuilder, TableBuilderColumn} from 'baseui/table-semantic';
import {StyledDivider} from 'baseui/divider';
import {ButtonGroup, SIZE, SHAPE} from "baseui/button-group";
import {Button} from "baseui/button";
import {Avatar} from 'baseui/avatar';

// DB imports
import { Model, setEngine, FieldType, LogEngine, IndexedDBEngine } from 'soukai';

// Use the IndexedDB engine and enable debug logging
const engine = new IndexedDBEngine();
setEngine(new LogEngine(engine));

// Definine contact schema for DB
class Contact extends Model {
  static fields = {
      photo: FieldType.String,
      name: FieldType.String,
      phone: FieldType.String,
      email: FieldType.String,
      city: FieldType.String,
  }
}

const Index: React.FC = () => {
  const [mainItems, setMainItems] = React.useState<NavItem[]>([]);
  const [data, setData] = useState<Row[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all contacts
        const contacts = await Contact.all();

        // Assign response to rows
        const mappedContacts: Row[] = contacts.map(contact => ({
          id: contact.getAttribute('id') || '',
          photo: contact.getAttribute('photo') || '',
          name: contact.getAttribute('name') || '',
          phone: contact.getAttribute('phone') || '',
          email: contact.getAttribute('email') || '',
          city: contact.getAttribute('city') || '',
          selected: false,
        }));
        setData(mappedContacts);

        if (mappedContacts.length < 1) {
          console.log("No contacts found");
        }

      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    }
    fetchData();
  }, []);

  // Function to create a contact
  async function createContact() {
    try {
      const response = await fetch('https://randomuser.me/api/');
      if (response.ok) {
        const data = await response.json();
        await Contact.create({
          photo: data.results[0].picture.large,
          name: data.results[0].name.first + " " + data.results[0].name.last,
          phone: data.results[0].phone,
          email: data.results[0].email,
          city: data.results[0].location.city,
        });
      } else {
        console.error('Failed to reach endpoint:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    } 
    window.location.reload();
  }

  // Function to delete a contact
  async function deleteContact() {
    const selectedContacts = data.filter((row) => row.selected);
    
    if ( selectedContacts.length > 0) {
      console.log("Deleting contact", selectedContacts);
      
      selectedContacts.forEach(async (contact) => {
        const selectedDB = await Contact.find(contact.id);
        await selectedDB.delete();
      });

      window.location.reload();
    } else {
      alert("No contacts selected");
    }
  }

  // type defition for rows
  type Row = {
    id: string;
    photo: string;
    name: string;
    phone: string;
    email: string;
    city: string;
    selected: boolean;
  };

  const hasAny = Boolean(data.length);
  const hasAll = hasAny && data.every((x) => x.selected);
  const hasSome = hasAny && data.some((x) => x.selected);

  function toggleAll() {
    setData((data) =>
      data.map((row) => ({
        ...row,
        selected: !hasAll,
      })),
    );
  }
  
  function toggle(event: any) {
    const {name, checked} = event.currentTarget;
    setData((data) =>
      data.map((row) => ({
        ...row,
        selected: String(row.id) === name ? checked : row.selected,
      })),
    );
  }

  return (
    <div>
      <div>
        <AppNavBar
          title="Solid Contacts"
          mainItems={mainItems}
          onMainItemSelect={item => {
            setMainItems(prev => setItemActive(prev, item));
          }}
          username="George Bolmida"
          usernameSubtitle="id.inrupt.com/g-bolmida"
          userItems={[
            { icon: Delete, label: "Log Out" }
          ]}
          onUserItemSelect={item => console.log(item)}
        />
      </div>
      <StyledDivider />
      <div>
        <TableBuilder data={data}>
          <TableBuilderColumn
            overrides={{
              TableHeadCell: {style: {width: '1%'}},
              TableBodyCell: {style: {width: '1%'}},
            }}
            header={
              <Checkbox
                checked={hasAll}
                isIndeterminate={!hasAll && hasSome}
                onChange={toggleAll}
              />
            }
          >
            {(row: Row) => (
              <Checkbox
                name={'' + row.id}
                checked={row.selected}
                onChange={toggle}
              />
            )}
          </TableBuilderColumn>
          <TableBuilderColumn<Row> header="Avatar">
            {(row: Row) => (
              <Avatar name={row.name} size="40px" src={row.photo} />
            )}
          </TableBuilderColumn>
          <TableBuilderColumn header="Name">
            {(row: Row) => row.name}
          </TableBuilderColumn>
          <TableBuilderColumn header="Phone">
            {(row: Row) => row.phone}
          </TableBuilderColumn>
          <TableBuilderColumn header="Email">
            {(row: Row) => row.email}
          </TableBuilderColumn>
          <TableBuilderColumn header="City">
            {(row: Row) => row.city}
          </TableBuilderColumn>
        </TableBuilder>
      </div>
      <div style={{ padding: '10px' }} >
        <ButtonGroup size={SIZE.large} shape={SHAPE.pill}>
          <Button onClick={createContact}>Add</Button>
          <Button onClick={deleteContact}>Delete</Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default Index;
