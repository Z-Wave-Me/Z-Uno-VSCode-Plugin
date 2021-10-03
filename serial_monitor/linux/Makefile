#####################################################################################
# Список исходников которые нужно скампилировать
SOURCES				=	srcs/serial_monitor.c

# Список дериктории для библиотек компилируемых
MAKE_LIB_DIRS	= 

# Все деректории в которых от он будет искать .h файлы
INC_DIR =	$(abspath includes/)

# Список не компилируемых биоблитек которые подключаем при компиляции
LIB = 

# Название исполняемых файлов для компиляции - зависит от платформы
GCC_C = gcc
GCC_S = gcc
GCC_CPP = gcc
GCC_LD = gcc
GCC_SIZE = 
GCC_COPY = 

# Флаги компиляции .S файлов - его можно менять - опциональный доп свойства
OPTIONAL_FLAGS_S ?= 

# Флаги компиляции .c файлов - его можно менять - опциональный доп свойства
OPTIONAL_FLAGS_C ?= 

# Флаги компиляции .cpp файлов - его можно менять - опциональный доп свойства
OPTIONAL_FLAGS_CPP ?= 

# Флаги финальной сборки - его можно менять - опциональный доп свойства
OPTIONAL_FLAGS_LD ?= 

# Что бы биоблетека собиралась для работы во флеше и функциии распалогала в ram
export EMLIB_OPTIONAL_FLAGS_C = 


#####################################################################################
# Содержит путь где хранить обьектники и финальный файл - его можно менять
OBJ_DIR ?= objs/

# Содержит путь где хранить обьектники и финальный файл для компилируемых биоблиотек- его можно менять
OBJ_LIB_PATH ?= $(OBJ_DIR)lib/

# Флаги компиляции отвечающий за оптимизацию самый стабильный - его можно менять
override OPFLAGS ?= -O2

# Флаги компиляции отвечающий за проверку самый стабильный - его можно менять
override FLAGS ?= -Wall -Wextra -Werror 

# Флаги компиляции .S файлов
FLAGS_S = $(OPFLAGS) $(FLAGS) $(OPTIONAL_FLAGS_S)

# Флаги компиляции .c файлов
FLAGS_C = $(OPFLAGS) $(FLAGS) $(OPTIONAL_FLAGS_C)

# Флаги компиляции .cpp файлов
FLAGS_CPP = $(OPFLAGS) $(FLAGS) $(OPTIONAL_FLAGS_CPP)

# Флаги финальной сборки
FLAGS_LD = $(OPFLAGS) $(FLAGS) $(OPTIONAL_FLAGS_LD)

# Список файлов с биоблитек которые подключаем при компиляции - компилируемые биоблиотеки
MAKE_LIB			= $(foreach x,$(MAKE_LIB_DIRS),$(OBJ_LIB_PATH)$(notdir $(x))/$(notdir $(x)).a)

# Имя выходного файла
NAME = $(notdir $(CURDIR))

# Делаем нашу фактическую цель - финальный файл
NAME_OBJ		= $(OBJ_DIR)$(NAME)


# Получаем Список обькектных файлов которые должны быть или иначе создаем - учитываем что это могут быть не только .c, но .cpp и .s файлы
OBJ_FILES		= $(patsubst %.cpp,$(OBJ_DIR)%.o,$(filter %.cpp,$(SOURCES))) $(patsubst %.c,$(OBJ_DIR)%.o,$(filter %.c,$(SOURCES))) $(patsubst %.S,$(OBJ_DIR)%.o,$(filter %.S,$(SOURCES)))

# Из обьектников создаем списов .d файлов
D_FILES			= $(patsubst %.o,%.d,$(OBJ_FILES))

# Из списка файлов получаем список путей где будем хранить обьектники и с помощью сортировке удаляем все повторы - тем самым этот список можно использовать как правило для создания необходимы папок
OBJ_PATHS		= $(sort $(foreach x,$(SOURCES),$(OBJ_DIR)$(dir $(x))))

# Создаем аргумент для компилятора от куда где он будет искать .h файлы
INCLUDES		= $(foreach x,$(INC_DIR),-I $(x))

# Для удобства и универсальности что бы обработать биоблитеки с помощью ихнего MakeFile
MAKE_LIB_CMD_ALL		= $(addsuffix .all,$(MAKE_LIB_DIRS))
MAKE_LIB_CMD_DEBUG		= $(addsuffix .debug,$(MAKE_LIB_DIRS))
MAKE_LIB_CMD_TEST		= $(addsuffix .test,$(MAKE_LIB_DIRS))
MAKE_LIB_CMD_CLEAN		= $(addsuffix .clean,$(MAKE_LIB_DIRS))
MAKE_LIB_CMD_FCLEAN		= $(addsuffix .fclean,$(MAKE_LIB_DIRS))

# Самое первое правило которое действует по умолчаниюю
all: $(NAME)

# Правило компиляции с отладочной информацией  - для отладки
debug:
	@$(MAKE) OPFLAGS="-g3"

# Правило для случая когда без флагов строгой компиляции
test:
	@$(MAKE) FLAGS=""

# Удаляем все обьектники кроме основного
clean: $(MAKE_LIB_CMD_CLEAN)
	@rm -f $(OBJ_FILES) $(D_FILES)

# Все удаляем
fclean: $(MAKE_LIB_CMD_FCLEAN) clean
	@rm -f $(NAME_OBJ)
	@rm -fr $(OBJ_DIR)

# Удалим все обектники и скомпилим заново
re: fclean all

# Правило которое если нету обьктного файла соответсвуещего сишному файлу или сищный файл изменился тогда скомпилируем обьктный файл для с и с++ файлов
$(OBJ_DIR)%.o: %.S
	@$(GCC_S) $(FLAGS_S)  -c $< -o $@ $(INCLUDES) -MD
$(OBJ_DIR)%.o: %.c
	@$(GCC_C) $(FLAGS_C)  -c $< -o $@ $(INCLUDES) -MD
$(OBJ_DIR)%.o: %.cpp
	@$(GCC_CPP) $(FLAGS_CPP) -c $< -o $@ $(INCLUDES) -MD

# Правило срабатывающее при проверки цели основной - что переводит на проверку папок для обьектников и потом действительного финальной цели
$(NAME): $(OBJ_DIR) $(OBJ_PATHS) $(OBJ_LIB_PATH) $(NAME_OBJ) 

# Провераем сам обьект и ообьектники а так же биоблетеки статичные может нужно скомпилировать
$(NAME_OBJ): $(OBJ_FILES) $(MAKE_LIB) 
	@$(GCC_LD) -static $(FLAGS_LD) $(OBJ_FILES) -o $(NAME_OBJ) $(MAKE_LIB) $(LIB) $(MAKE_LIB) $(LIB) -lpthread

# Если нужно создаем папку корневую для обьектников
$(OBJ_DIR):
	@mkdir $(OBJ_DIR)

# Если нужно создаем папку или множество папок для оьектников биоблетек
$(OBJ_LIB_PATH):
	@mkdir -p $(OBJ_LIB_PATH)

# Если нужно создаем папку или множество папок для оьектников
$(OBJ_PATHS):
	@mkdir -p $(OBJ_PATHS)

# Если в  makefile  юзаеться make name то тут проверяем изменения в биоблетеках всех
$(MAKE_LIB): $(MAKE_LIB_CMD_ALL)

# Правило all для всех биоблетек - плюс добавляем путь для обьектников
%.all:
	@$(MAKE) -C $* OBJ_DIR=$(abspath $(OBJ_LIB_PATH)$(notdir $*))/ OPFLAGS=$(OPFLAGS)

# Правило debug для всех биоблетек - плюс добавляем путь для обьектников
%.debug:
	@$(MAKE) -C $* OBJ_DIR=$(abspath $(OBJ_LIB_PATH)$(notdir $*))/ OPFLAGS=$(OPFLAGS)

# Правило test для всех биоблетек - плюс добавляем путь для обьектников
%.test:
	@$(MAKE) -C $* FLAGS="" OBJ_DIR=$(abspath $(OBJ_LIB_PATH)$(notdir $*))/  OPFLAGS=$(OPFLAGS)

# Правило clean для всех биоблетек - плюс добавляем путь для обьектников
%.clean:
	@$(MAKE) -C $* clean OBJ_DIR=$(abspath $(OBJ_LIB_PATH)$(notdir $*))/

# Правило fclean для всех биоблетек - плюс добавляем путь для обьектников
%.fclean:
	@$(MAKE) -C $* fclean OBJ_DIR=$(abspath $(OBJ_LIB_PATH)$(notdir $*))/

# При компеляции обьктых файлов создаються файлы соответсвий - тоесть что требеуться для компеляции данного сишного файла в обьктынй и при измененении одного из них заного скомпилируеться - черточка не вызыает ошибку если файлов этих нет
-include $(D_FILES)

# Список используемых команд в MakeFile что бы не спутало с файлами в каталоге
.PHONY: all clean fclean re debug test