/// Module: pet_nft
#[allow(lint(self_transfer), unused_const)]
module pet_nft::pet_nft {
    use std::string::{Self, String};
    use sui::url::{Self, Url};
    use sui::event;
    use sui::package;
    use sui::display;
    use sui::table::{Self, Table};

    // Pet types
    const PET_TYPE_DOG: u8 = 1;
    const PET_TYPE_CAT: u8 = 2;
    const PET_TYPE_DRAGON: u8 = 3;

    // Error codes
    const EInvalidPetType: u64 = 0;
    const ETaskAlreadyCompleted: u64 = 1;
    const ETaskNotFound: u64 = 2;

    /// Pet NFT structure
    public struct PetNFT has key, store {
        id: UID,
        name: String,
        description: String,
        pet_type: u8, // 1=dog, 2=cat, 3=dragon
        level: u64,
        experience: u64,
        image_url: Url,
        completed_tasks: Table<String, bool>,
    }

    /// One-Time-Witness for the module
    public struct PET_NFT has drop {}

    /// Event emitted when a pet is minted
    public struct PetMinted has copy, drop {
        object_id: ID,
        creator: address,
        name: String,
        pet_type: u8,
    }

    /// Event emitted when a task is completed
    public struct TaskCompleted has copy, drop {
        pet_id: ID,
        task_name: String,
        new_level: u64,
        experience_gained: u64,
    }

    /// Event emitted when pet levels up
    public struct PetLevelUp has copy, drop {
        pet_id: ID,
        old_level: u64,
        new_level: u64,
    }

    /// Module initializer
    fun init(otw: PET_NFT, ctx: &mut TxContext) {
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"type"),
            string::utf8(b"level"),
            string::utf8(b"experience"),
        ];

        let values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{image_url}"),
            string::utf8(b"{pet_type}"),
            string::utf8(b"{level}"),
            string::utf8(b"{experience}"),
        ];

        let publisher = package::claim(otw, ctx);

        let mut display = display::new_with_fields<PetNFT>(
            &publisher, keys, values, ctx
        );

        display::update_version(&mut display);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
    }

    /// Mint a new pet NFT
    public fun mint_pet(
        name: vector<u8>,
        description: vector<u8>,
        pet_type: u8,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(pet_type >= PET_TYPE_DOG && pet_type <= PET_TYPE_DRAGON, EInvalidPetType);

        let sender = tx_context::sender(ctx);
        let id = object::new(ctx);
        let pet_id = object::uid_to_inner(&id);

        let pet = PetNFT {
            id,
            name: string::utf8(name),
            description: string::utf8(description),
            pet_type,
            level: 1,
            experience: 0,
            image_url: url::new_unsafe_from_bytes(image_url),
            completed_tasks: table::new(ctx),
        };

        event::emit(PetMinted {
            object_id: pet_id,
            creator: sender,
            name: pet.name,
            pet_type,
        });

        transfer::transfer(pet, sender);
    }

    /// Complete a task and gain experience
    public fun complete_task(
        pet: &mut PetNFT,
        task_name: vector<u8>,
        experience_reward: u64,
    ) {
        let task_string = string::utf8(task_name);
        
        // Check if task already completed
        if (table::contains(&pet.completed_tasks, task_string)) {
            assert!(*table::borrow(&pet.completed_tasks, task_string) == false, ETaskAlreadyCompleted);
        };

        // Mark task as completed
        if (table::contains(&pet.completed_tasks, task_string)) {
            *table::borrow_mut(&mut pet.completed_tasks, task_string) = true;
        } else {
            table::add(&mut pet.completed_tasks, task_string, true);
        };

        let old_level = pet.level;
        pet.experience = pet.experience + experience_reward;

        // Level up logic: every 100 experience points = 1 level
        let new_level = 1 + (pet.experience / 100);
        if (new_level > old_level) {
            pet.level = new_level;
            event::emit(PetLevelUp {
                pet_id: object::uid_to_inner(&pet.id),
                old_level,
                new_level,
            });
        };

        event::emit(TaskCompleted {
            pet_id: object::uid_to_inner(&pet.id),
            task_name: task_string,
            new_level: pet.level,
            experience_gained: experience_reward,
        });
    }

    /// Get pet information
    public fun get_pet_info(pet: &PetNFT): (String, String, u8, u64, u64) {
        (pet.name, pet.description, pet.pet_type, pet.level, pet.experience)
    }

    /// Check if a task is completed
    public fun is_task_completed(pet: &PetNFT, task_name: String): bool {
        if (table::contains(&pet.completed_tasks, task_name)) {
            *table::borrow(&pet.completed_tasks, task_name)
        } else {
            false
        }
    }

    /// Get pet name
    public fun name(pet: &PetNFT): &String {
        &pet.name
    }

    /// Get pet description
    public fun description(pet: &PetNFT): &String {
        &pet.description
    }

    /// Get pet type
    public fun pet_type(pet: &PetNFT): u8 {
        pet.pet_type
    }

    /// Get pet level
    public fun level(pet: &PetNFT): u64 {
        pet.level
    }

    /// Get pet experience
    public fun experience(pet: &PetNFT): u64 {
        pet.experience
    }

    /// Get image URL
    public fun image_url(pet: &PetNFT): &Url {
        &pet.image_url
    }

    /// Update pet description (only owner can do this)
    public fun update_description(pet: &mut PetNFT, new_description: vector<u8>) {
        pet.description = string::utf8(new_description);
    }

    /// Update pet image URL (only owner can do this)
    public fun update_image_url(pet: &mut PetNFT, new_url: vector<u8>) {
        pet.image_url = url::new_unsafe_from_bytes(new_url);
    }
}


